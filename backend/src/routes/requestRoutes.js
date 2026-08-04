import express from 'express';
import {
  getAllRequests,
  getRequestById,
  createRequest,
  updateRequest,
  deleteRequest,
} from '../controllers/requestController.js';

const router = express.Router();

router.route('/')
  .get(getAllRequests)
  .post(createRequest);

router.route('/:id')
  .get(getRequestById)
  .put(updateRequest)
  .delete(deleteRequest);

export default router;
