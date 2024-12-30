// const mongoose = require('mongoose');

const { 
    Tag, 
    createTag, 
    getAllTags, 
    getTagsByCategory, 
    updateTags, 
    addTagsToCategory, 
    removeTagsFromCategory, 
    deleteCategory 
} = require("../models/tagModel");

class JobTagger {
    constructor(techTerms) {
        this.techTerms = techTerms;
    }

    cleanText(text) {
        // Clean and normalize text
        return text.toLowerCase()
            .replace(/[^a-z0-9\s]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    }

    escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    extractTerms(text) {
        const cleanedText = this.cleanText(text);
        console.log("Clean text: ", cleanedText);

        // Initialize tags object with Sets
        const tags = {};
        
        // Dictionary-based matching
        for (const [category, terms] of Object.entries(this.techTerms)) {
            tags[category] = new Set();
            for (const term of terms) {
                try {
                    const escapedTerm = this.escapeRegExp(term);
                    const regex = new RegExp(`\\b${escapedTerm}\\b`, 'i');
                    if (regex.test(cleanedText)) {
                        tags[category].add(term);
                    }
                } catch (e) {
                    console.error(`Error with term "${term}":`, e);
                }
            }
        }

        // Convert Sets to Arrays for easier handling
        const result = {};
        for (const [category, termSet] of Object.entries(tags)) {
            result[category] = Array.from(termSet);
        }

        return result;
    }

    generateTags(title, description) {
        const combinedText = `${title} ${title} ${description}`;
        return this.extractTerms(combinedText);
    }

    getListOfTags(title, description) {
        const combinedText = `${title} ${title} ${description}`;
        const tags = this.extractTerms(combinedText);

        const listOfTags = [];

        for (const [category, terms] of Object.entries(tags)) {
            terms.forEach(term => listOfTags.push(term));
        }
        return listOfTags;
    }
}

async function initJobTagger() {
    const techTerms = {};
    const result = await getAllTags();

    result.data.forEach(doc => {
        const cate = doc.category
        const tagsArray = Array.isArray(doc.listOfTags) ? doc.listOfTags : [doc.listOfTags];
        techTerms[cate] = tagsArray;
    });

    const tagger = new JobTagger(techTerms);
    return tagger;
}

module.exports = {
    JobTagger,
    initJobTagger
};