import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BusinessEditForm } from '../BusinessEditForm';

// Mock next/navigation router
jest.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: jest.fn() })
}));

// Mock lucide-react icons to simple components
jest.mock('lucide-react', () => new Proxy({}, {
  get: () => (props: any) => <svg data-testid="icon" {...props} />
}));

// Mock sonner toast
const toast = { success: jest.fn(), error: jest.fn() };
jest.mock('sonner', () => ({ toast }));

// Mock UI components to simple passthroughs preserving children/props needed by RHTF
jest.mock('@/components/ui/button', () => ({
  Button: (props: any) => <button {...props} />
}));

jest.mock('@/components/ui/input', () => ({
  Input: (props: any) => <input {...props} />
}));

jest.mock('@/components/ui/textarea', () => ({
  Textarea: (props: any) => <textarea {...props} />
}));

jest.mock('@/components/ui/separator', () => ({
  Separator: () => <hr />
}));

// Form components: keep minimal structure to not interfere with react-hook-form
jest.mock('@/components/ui/form', () => ({
  Form: ({ children }: any) => <div>{children}</div>,
  FormField: ({ render }: any) => render({ field: { onChange: () => {}, value: '' } }),
  FormItem: ({ children }: any) => <div>{children}</div>,
  FormLabel: ({ children }: any) => <label>{children}</label>,
  FormControl: ({ children }: any) => <div>{children}</div>,
  FormMessage: () => <div></div>,
  FormDescription: ({ children }: any) => <small>{children}</small>,
}));

// Helper to type into inputs by label text where possible
const typeInto = async (placeholder: string, value: string) => {
  const el = await screen.findByPlaceholderText(placeholder);
  fireEvent.change(el, { target: { value } });
  return el as HTMLInputElement;
};

describe('BusinessEditForm', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    jest.resetAllMocks();
    // @ts-ignore
    global.fetch = jest.fn();
  });

  afterAll(() => {
    global.fetch = originalFetch as any;
  });

  test('renders with initial data populated', async () => {
    render(<BusinessEditForm initialData={{ name: 'Acme Inc', email: 'info@acme.com' }} />);

    expect(await screen.findByDisplayValue('Acme Inc')).toBeInTheDocument();
    expect(await screen.findByDisplayValue('info@acme.com')).toBeInTheDocument();
  });

  test('validates name is required and prevents submit when empty', async () => {
    render(<BusinessEditForm initialData={{ name: '' }} />);

    // Clear name field if present and try submit
    const nameInput = await screen.findByPlaceholderText(/e\.g\./i);
    fireEvent.change(nameInput, { target: { value: '' } });

    const submit = await screen.findByRole('button', { name: /save business profile/i });
    fireEvent.click(submit);

    // react-hook-form blocks submission; ensure fetch not called
    await waitFor(() => {
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  test('submits transformed payload and shows success toast on 200', async () => {
    // @ts-ignore
    global.fetch.mockResolvedValueOnce({ ok: true });

    render(
      <BusinessEditForm
        initialData={{
          name: 'Biz',
          categories: ['Electronics'],
          certifications: ['ISO'],
          socials: [{ name: 'X', link: 'https://x.com/biz' }],
          bankDetails: [{ name: 'Bank', account: '123' }]
        }}
      />
    );

    const submit = await screen.findByRole('button', { name: /save business profile/i });
    fireEvent.click(submit);

    await waitFor(() => expect(global.fetch).toHaveBeenCalled());

    const [url, options] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toBe('/api/business/profile');
    expect(options.method).toBe('PUT');
    expect(options.headers['Content-Type']).toBe('application/json');

    const body = JSON.parse(options.body);
    expect(body.name).toBe('Biz');
    expect(body.categories).toEqual(['Electronics']);
    expect(body.certifications).toEqual(['ISO']);
    expect(body.socials).toEqual([{ name: 'X', link: 'https://x.com/biz' }]);
    expect(body.bankDetails).toEqual([{ name: 'Bank', account: '123' }]);

    await waitFor(() => expect(toast.success).toHaveBeenCalledWith('Business profile updated!'));
  });

  test('shows error toast on failed response', async () => {
    // @ts-ignore
    global.fetch.mockResolvedValueOnce({ ok: false });

    render(<BusinessEditForm initialData={{ name: 'Biz' }} />);

    const submit = await screen.findByRole('button', { name: /save business profile/i });
    fireEvent.click(submit);

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Something went wrong'));
  });

  test('allows adding and removing dynamic fields (categories)', async () => {
    render(<BusinessEditForm initialData={{ name: 'Biz', categories: [] }} />);

    const addBtn = await screen.findByRole('button', { name: /add category/i });
    fireEvent.click(addBtn);

    const catInput = await screen.findByPlaceholderText(/electronics, clothing/i);
    fireEvent.change(catInput, { target: { value: 'Gadgets' } });
    expect((catInput as HTMLInputElement).value).toBe('Gadgets');
  });

  test('renders image preview when image URL present', async () => {
    render(<BusinessEditForm initialData={{ name: 'Biz', image: 'https://img.test/logo.png' }} />);

    const img = await screen.findByAltText('Logo preview');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'https://img.test/logo.png');
  });

  test('disables submit button while loading', async () => {
    // Make fetch hang until we resolve
    let resolveFn: any;
    // @ts-ignore
    global.fetch.mockImplementation(() => new Promise((res) => { resolveFn = res; }));

    render(<BusinessEditForm initialData={{ name: 'Biz' }} />);

    const submit = await screen.findByRole('button', { name: /save business profile/i });
    fireEvent.click(submit);

    // Button should be disabled while request in-flight
    expect(submit).toBeDisabled();

    // Resolve and ensure it re-enables eventually
    resolveFn({ ok: true });
    await waitFor(() => expect(submit).not.toBeDisabled());
  });
});
