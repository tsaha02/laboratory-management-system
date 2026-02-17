import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import Package from '../models/package.model';

export const getAllPackages = async (req: Request, res: Response) => {
  try {
    const packages = await Package.findAll();
    res.status(200).json(packages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching packages.' });
  }
};

export const getPackageById = async (req: Request, res: Response) => {
  try {
    const pkg = await Package.findById(Number(req.params.id));
    if (!pkg) {
      return res.status(404).json({ message: 'Package not found.' });
    }
    res.status(200).json(pkg);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching package.' });
  }
};

export const createPackage = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, description, price, testIds } = req.body;

  try {
    const newPackage = await Package.create(
      { name, description, price },
      testIds || []
    );
    res.status(201).json({
      message: 'Package created successfully!',
      package: newPackage,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error creating package.' });
  }
};

export const updatePackage = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const { name, description, price, testIds } = req.body;

  try {
    const existing = await Package.findById(id);
    if (!existing) {
      return res.status(404).json({ message: 'Package not found.' });
    }

    const updatedPackage = await Package.update(
      id,
      { name, description, price },
      testIds
    );

    res.status(200).json({
      message: 'Package updated successfully!',
      package: updatedPackage,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error updating package.' });
  }
};

export const deletePackage = async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  try {
    const existing = await Package.findById(id);
    if (!existing) {
      return res.status(404).json({ message: 'Package not found.' });
    }

    await Package.delete(id);
    res.status(200).json({ message: 'Package deleted successfully!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error deleting package.' });
  }
};
