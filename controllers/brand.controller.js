import brandModel from "../models/brand.model.js";
import factoryHandler from "./handlersFactory.controller.js";

const getBrands = factoryHandler.getAll(brandModel, "Brand");
const getBrand = factoryHandler.getOne(brandModel);
const createBrand = factoryHandler.createOne(brandModel);
const updateBrand = factoryHandler.updateOne(brandModel);
const deleteBrand = factoryHandler.deleteOne(brandModel);

export { getBrands, getBrand, updateBrand, createBrand, deleteBrand };
