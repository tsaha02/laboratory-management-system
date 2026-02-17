import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import Test from '../models/test.model';

export const getAllTests = async (req: Request, res: Response) => {
  try {
    const tests = await Test.findAll();
    res.status(200).json(tests);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching tests.' });
  }
};

export const getTestById = async (req: Request, res: Response) => {
  try {
    const test = await Test.findById(Number(req.params.id));
    if (!test) {
      return res.status(404).json({ message: 'Test not found.' });
    }
    res.status(200).json(test);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching test.' });
  }
};

export const createTest = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, description, price, category } = req.body;

  try {
    const [newTest] = await Test.create({ name, description, price, category });
    res.status(201).json({
      message: 'Test created successfully!',
      test: newTest,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error creating test.' });
  }
};

export const updateTest = async (req: Request, res: Response) => {
  const { name, description, price, category } = req.body;
  const id = Number(req.params.id);

  try {
    const existingTest = await Test.findById(id);
    if (!existingTest) {
      return res.status(404).json({ message: 'Test not found.' });
    }

    const [updatedTest] = await Test.update(id, {
      name,
      description,
      price,
      category,
    });

    res.status(200).json({
      message: 'Test updated successfully!',
      test: updatedTest,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error updating test.' });
  }
};

export const deleteTest = async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  try {
    const existingTest = await Test.findById(id);
    if (!existingTest) {
      return res.status(404).json({ message: 'Test not found.' });
    }

    await Test.delete(id);
    res.status(200).json({ message: 'Test deleted successfully!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error deleting test.' });
  }
};
