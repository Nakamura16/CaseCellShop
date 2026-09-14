import { IProductRepository } from "../Repositories/Interfaces/product-repository";

export class ProductService {
  constructor(private readonly productRepository: IProductRepository) {}

  async getAll() {
    return this.productRepository.getAll();
  }

  async getById(id: string) {
    return this.productRepository.findById(id);
  }
}
