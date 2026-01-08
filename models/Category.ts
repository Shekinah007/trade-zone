import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICategory extends Document {
    name: string;
    slug: string;
    icon?: string;
    parent?: mongoose.Types.ObjectId;
}

const CategorySchema = new Schema<ICategory>({
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    icon: String,
    parent: { type: Schema.Types.ObjectId, ref: 'Category' }
});

const Category: Model<ICategory> = mongoose.models?.Category || mongoose.model('Category', CategorySchema);
export default Category;
