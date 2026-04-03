import { PrismaClient } from '@prisma/client';
import winston from '../utils/logger.js';
import fs from 'fs';

const prisma = new PrismaClient();

/**
 * Guru creates a learning module (PDF upload and assign to Rombel).
 */
export const createModule = async (req, res, next) => {
  const { title, rombelId } = req.body;

  if (!req.file) {
    return res.status(400).json({ status: 'error', message: 'PDF file is required' });
  }

  try {
    const newModule = await prisma.modul.create({
      data: {
        title,
        filePath: req.file.path,
        guruId: req.user.id,
        rombelId
      }
    });

    winston.info(`Module ${newModule.title} created by Guru ${req.user.username}`);

    res.status(201).json({
      status: 'success',
      data: newModule
    });
  } catch (error) {
    winston.error(`Module creation failed: ${error.message}`);
    // Cleanup the uploaded file if database create fails
    if (req.file) fs.unlinkSync(req.file.path);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

/**
 * Guru updates a module.
 */
export const updateModule = async (req, res, next) => {
  const { id } = req.params;
  const { title, rombelId } = req.body;

  try {
    const existingModule = await prisma.modul.findUnique({ where: { id } });
    if (!existingModule || existingModule.guruId !== req.user.id) {
      return res.status(403).json({ status: 'error', message: 'Forbidden' });
    }

    const data = { title, rombelId };
    if (req.file) {
      // Delete old file
      if (fs.existsSync(existingModule.filePath)) fs.unlinkSync(existingModule.filePath);
      data.filePath = req.file.path;
    }

    const updated = await prisma.modul.update({
      where: { id },
      data
    });

    res.json({ status: 'success', data: updated });
  } catch (error) {
    winston.error(`Module update failed: ${error.message}`);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

/**
 * Guru retrieves their modules.
 */
export const getMyModules = async (req, res, next) => {
  try {
    const modules = await prisma.modul.findMany({
      where: { guruId: req.user.id },
      include: { rombel: { select: { name: true } } }
    });
    res.json({ status: 'success', data: modules });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

/**
 * Guru deletes a module and its physical file.
 */
export const deleteModule = async (req, res, next) => {
  const { id } = req.params;

  try {
    const existingModule = await prisma.modul.findUnique({ where: { id } });
    if (!existingModule || existingModule.guruId !== req.user.id) {
      return res.status(403).json({ status: 'error', message: 'Forbidden' });
    }

    // Delete from DB first
    await prisma.modul.delete({ where: { id } });

    // Cleanup the physical file
    if (fs.existsSync(existingModule.filePath)) {
        fs.unlinkSync(existingModule.filePath);
    }

    winston.info(`Module ${existingModule.title} deleted by Guru ${req.user.username}`);

    res.json({
      status: 'success',
      message: 'Module deleted successfully'
    });
  } catch (error) {
    winston.error(`Module deletion failed: ${error.message}`);
    res.status(500).json({ status: 'error', message: error.message });
  }
};
