import { Router } from 'express';
import {
  getCollections,
  getCollectionById,
  createCollection,
  updateCollection,
  deleteCollection,
  addStyleToCollection,
  removeStyleFromCollection,
} from '../controllers/collections.controller';
import { authenticate, optionalAuthenticate } from '../middleware/auth';

const router = Router();

// All collection routes require authentication
router.get('/', authenticate, getCollections);
router.get('/:id', optionalAuthenticate, getCollectionById);
router.post('/', authenticate, createCollection);
router.put('/:id', authenticate, updateCollection);
router.delete('/:id', authenticate, deleteCollection);

// Add/remove styles from collection
router.post('/:id/styles/:styleId', authenticate, addStyleToCollection);
router.delete('/:id/styles/:styleId', authenticate, removeStyleFromCollection);

export default router;
