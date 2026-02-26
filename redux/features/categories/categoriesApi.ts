import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface Category {
    _id: string;
    name: string;
    slug: string;
    icon?: string;
    parent?: string;
}

export const categoriesApi = createApi({
    reducerPath: "categoriesApi",
    baseQuery: fetchBaseQuery({
        baseUrl: "/api",
    }),
    tagTypes: ["Category"],
    endpoints: (builder) => ({
        getCategories: builder.query<Category[], void>({
            query: () => "/categories",
            providesTags: ["Category"],
        }),

        createCategory: builder.mutation<void, { name: string; icon?: string; parent?: string }>({
            query: (body) => ({
                url: "/categories",
                method: "POST",
                body,
            }),
            invalidatesTags: ["Category"],
        }),

        updateCategory: builder.mutation<
            void,
            { id: string; name: string; icon?: string; parent?: string }
        >({
            query: ({ id, ...body }) => ({
                url: `/categories/${id}`,
                method: "PUT",
                body,
            }),
            invalidatesTags: ["Category"],
        }),

        deleteCategory: builder.mutation<void, string>({
            query: (id) => ({
                url: `/categories/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Category"],
        }),
    }),
});

export const {
    useGetCategoriesQuery,
    useCreateCategoryMutation,
    useUpdateCategoryMutation,
    useDeleteCategoryMutation,
} = categoriesApi;
