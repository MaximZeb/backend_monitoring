"use strict";
const brain = require('brain.js');
const fs = require('fs');
const config = {
    activation: 'sigmoid',
    hiddenLayers: [16, 16],
    learningRate: 0.3,
    iterations: 5000,
};
const net = new brain.NeuralNetwork(config);
const modelFileName = 'fact_prediction_model.json';
// Замоканные данные для обучения
const trainingData = [
    { plan: 500, fact: 510 },
    { plan: 600, fact: 508 },
    { plan: 760, fact: 720 },
    { plan: 200, fact: 300 },
    { plan: 900, fact: 400 },
    { plan: 900, fact: 400 },
    { plan: 30, fact: 100 },
    { plan: 700, fact: 720 },
    { plan: 250, fact: 300 },
    { plan: 0, fact: 0 },
    { plan: 100, fact: 0 },
    { plan: 200, fact: 300 },
    { plan: 900, fact: 400 },
    { plan: 0, fact: 0 },
    { plan: 30, fact: 100 },
    { plan: 300, fact: 320 },
    { plan: 300, fact: 299 },
    { plan: 0, fact: 200 },
    { plan: 100, fact: 0 },
    { plan: 100, fact: 100 },
];
function prepareData(data) {
    const fact = data.fact === undefined ? 0 : data.fact;
    const preparedData = {
        input: {
            plan: data.plan / 900,
        },
        output: [fact / 720],
    };
    return preparedData;
}
function prepareInputForPrediction(inputData) {
    const prepared = {
        plan: inputData.plan / 900,
    };
    return prepared;
}
function denormalizeOutput(normalizedValue) {
    const denormalizedValue = Math.round(normalizedValue * 720);
    return denormalizedValue;
}
function trainNetwork() {
    const preparedData = trainingData.map(item => {
        const preparedItem = prepareData(item);
        return preparedItem;
    });
    net.train(preparedData);
}
function getPrediction(inputData) {
    const preparedInput = prepareInputForPrediction(inputData);
    const output = net.run(preparedInput);
    const denormalizedOutput = denormalizeOutput(output[0]);
    return denormalizedOutput;
}
function saveModel() {
    const model = net.toJSON();
    fs.writeFileSync(modelFileName, JSON.stringify(model));
    console.log('Model saved.');
}
function loadModel() {
    try {
        const modelString = fs.readFileSync(modelFileName, 'utf8');
        const model = JSON.parse(modelString);
        net.fromJSON(model);
        console.log('Model loaded.');
    }
    catch (error) {
        console.warn('No saved model found. Starting with a new model.');
    }
}
module.exports = {
    trainNetwork,
    getPrediction,
    saveModel,
    loadModel,
};
