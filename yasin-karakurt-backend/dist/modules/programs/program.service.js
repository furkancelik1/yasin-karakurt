"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProgram = exports.getProgramsByClient = exports.getProgramById = exports.createProgram = void 0;
const database_1 = require("../../config/database");
const error_middleware_1 = require("../../middleware/error.middleware");
const createProgram = async (data) => {
    return database_1.prisma.program.create({ data, include: { client: { include: { profile: true } } } });
};
exports.createProgram = createProgram;
const getProgramById = async (id) => {
    const program = await database_1.prisma.program.findUnique({
        where: { id },
        include: {
            client: { include: { profile: true } },
            trainer: { include: { profile: true } },
            weeks: { include: { days: { include: { exercises: true } } }, orderBy: { weekNumber: 'asc' } },
        },
    });
    if (!program)
        throw new error_middleware_1.AppError('Program bulunamadı', 404);
    return program;
};
exports.getProgramById = getProgramById;
const getProgramsByClient = async (clientId) => {
    return database_1.prisma.program.findMany({
        where: { clientId },
        include: { weeks: { include: { days: { include: { exercises: true } } } } },
        orderBy: { createdAt: 'desc' },
    });
};
exports.getProgramsByClient = getProgramsByClient;
const updateProgram = async (id, data) => {
    return database_1.prisma.program.update({ where: { id }, data });
};
exports.updateProgram = updateProgram;
