const History = require('../models/History');
const Prediction = require('../models/Prediction');
const mongoose = require('mongoose');

const buildRecommendation = (recommendations = []) => ({
    needsConsultation: true,
    urgency: 'medium',
    details: Array.isArray(recommendations) ? recommendations : []
});

// Save prediction history from Quick Check
const saveUserHistory = async (req, res) => {
    try {
        const {
            imageInfo,
            diagnosis,
            symptoms,
            modelPrediction,
            symptomResults,
            recommendations
        } = req.body;

        if (!imageInfo?.name || !imageInfo?.size || !diagnosis?.condition) {
            return res.status(400).json({
                success: false,
                error: 'Missing diagnosis history fields'
            });
        }

        const confidence = Number(diagnosis.confidence || 0);
        const recommendation = buildRecommendation(recommendations);

        const prediction = await Prediction.create({
            userId: req.user.id,
            imageName: imageInfo.name,
            imageSize: imageInfo.size,
            predictionResults: modelPrediction?.allPredictions || [],
            symptomResults: symptomResults || [],
            combinedResults: [{
                disease: diagnosis.condition,
                confidence
            }],
            symptoms: symptoms || {},
            diagnosis: {
                condition: diagnosis.condition,
                confidence
            },
            recommendation: {
                needsConsultation: recommendation.needsConsultation,
                urgency: recommendation.urgency
            }
        });

        const history = await History.create({
            userId: req.user.id,
            predictionId: prediction._id,
            imageInfo,
            diagnosis: {
                condition: diagnosis.condition,
                confidence,
                imageConfidence: modelPrediction?.confidence,
                symptomConfidence: diagnosis.symptomConfidence
            },
            symptoms: symptoms || {},
            recommendation
        });

        res.status(201).json({ success: true, history });
    } catch (error) {
        console.error('Failed to save history:', error);
        res.status(500).json({ error: 'Failed to save history' });
    }
};

// Fetch user history
const getUserHistory = async (req, res) => {
    try {
        const history = await History.find({ userId: req.user.id }).sort({ date: -1 }); // Fetch history sorted by date
        res.json({ success: true, history });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch history' });
    }
};

const getHistoryEntry = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ error: 'Invalid history ID' });
        }

        const history = await History.findOne({ _id: req.params.id, userId: req.user.id });
        if (!history) {
            return res.status(404).json({ error: 'History entry not found' });
        }

        res.json({ success: true, history });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch history entry' });
    }
};

const deleteHistoryEntry = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ error: 'Invalid history ID' });
        }

        const history = await History.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
        if (!history) {
            return res.status(404).json({ error: 'History entry not found' });
        }

        await Prediction.deleteOne({ _id: history.predictionId, userId: req.user.id });
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete history entry' });
    }
};

module.exports = { 
    saveUserHistory,
    getUserHistory,
    getHistoryEntry,
    deleteHistoryEntry
};
