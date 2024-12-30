const Joi = require("joi");
const mongoose = require('mongoose');

const tagSchema = mongoose.Schema({
    category: {
        type: String,
        required: true,
        unique: true
    },
    listOfTags: {
        type: [String],
        required: true
    }
});

const Tag = mongoose.model('Tag', tagSchema);

// Create new category with tags
async function createTag(category, tags) {
    try {
        const newTag = new Tag({
            category,
            listOfTags: tags
        });
        const result = await newTag.save();
        return { success: true, data: result };
    } catch (error) {
        if (error.code === 11000) { // MongoDB duplicate key error code
            return { success: false, error: 'Category already exists' };
        }
        return { success: false, error: error.message };
    }
}

// Get all categories and their tags
async function getAllTags() {
    try {
        const tags = await Tag.find();
        return { success: true, data: tags };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Get tags by category
async function getTagsByCategory(category) {
    try {
        const tag = await Tag.findOne({ category });
        if (!tag) {
            return { success: false, error: 'Category not found' };
        }
        return { success: true, data: tag };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Update entire list of tags for a category
async function updateTags(category, newTags) {
    try {
        const result = await Tag.findOneAndUpdate(
            { category },
            { listOfTags: newTags },
            { new: true, runValidators: true }
        );
        if (!result) {
            return { success: false, error: 'Category not found' };
        }
        return { success: true, data: result };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Add new tags to existing category
async function addTagsToCategory(category, tagsToAdd) {
    try {
        const result = await Tag.findOneAndUpdate(
            { category },
            { $addToSet: { listOfTags: { $each: tagsToAdd } } },
            { new: true, runValidators: true }
        );
        if (!result) {
            return { success: false, error: 'Category not found' };
        }
        return { success: true, data: result };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Remove specific tags from a category
async function removeTagsFromCategory(category, tagsToRemove) {
    try {
        const result = await Tag.findOneAndUpdate(
            { category },
            { $pullAll: { listOfTags: tagsToRemove } },
            { new: true, runValidators: true }
        );
        if (!result) {
            return { success: false, error: 'Category not found' };
        }
        return { success: true, data: result };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Delete a category
async function deleteCategory(category) {
    try {
        const result = await Tag.findOneAndDelete({ category });
        if (!result) {
            return { success: false, error: 'Category not found' };
        }
        return { success: true, data: result };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Export all functions
module.exports = {
    Tag,
    createTag,
    getAllTags,
    getTagsByCategory,
    updateTags,
    addTagsToCategory,
    removeTagsFromCategory,
    deleteCategory
};