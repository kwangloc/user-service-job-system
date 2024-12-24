const statisticsService = require('../services/statisticsService');
const { publishEvent, formatNewUserMsg } = require('../../../rabbitmq/rabbitmqPublisher');

exports.growth = async (req, res, next) => {
  try {
    const users = await statisticsService.growth(req);
    res.status(200).json(users);
  } catch (err) {
    next(err);
  }
};

exports.demographic = async (req, res, next) => {
  try {
    const users = await statisticsService.demographic(req);
    res.status(200).json(users);
  } catch (err) {
    next(err);
  }
};

exports.userTracking = async (req, res, next) => {
  try {
    const users = await statisticsService.userTracking(req);
    res.status(200).json(users);
  } catch (err) {
    next(err);
  }
};

exports.getCities = async (req, res, next) => {
  try {
    const users = await statisticsService.getCities(req);
    res.status(200).json(users);
  } catch (err) {
    next(err);
  }
};

