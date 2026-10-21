package com.example.ecommerce.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.ecommerce.dto.Dtos.CategoryDto;
import com.example.ecommerce.dto.Dtos.CategoryRequest;
import com.example.ecommerce.entity.Category;
import com.example.ecommerce.exception.ApiException;
import com.example.ecommerce.repository.CategoryRepository;
import com.example.ecommerce.repository.ProductRepository;
import com.example.ecommerce.util.Mappers;

@Service
public class CategoryService {

	private final CategoryRepository categoryRepository;
	private final ProductRepository productRepository;

	public CategoryService(CategoryRepository categoryRepository, ProductRepository productRepository) {
		this.categoryRepository = categoryRepository;
		this.productRepository = productRepository;
	}

	@Transactional(readOnly = true)
	public List<CategoryDto> list() {
		return categoryRepository.findAllByOrderByNameAsc().stream().map(Mappers::categoryDto).toList();
	}

	@Transactional
	public CategoryDto create(CategoryRequest req) {
		String name = req.name().trim();
		if (categoryRepository.existsByNameIgnoreCase(name)) {
			throw ApiException.conflict("This category already exists");
		}
		return Mappers.categoryDto(categoryRepository.save(new Category(name)));
	}

	@Transactional
	public CategoryDto update(Long id, CategoryRequest req) {
		Category category = categoryRepository.findById(id)
				.orElseThrow(() -> ApiException.notFound("Category not found"));
		String name = req.name().trim();
		if (!category.getName().equalsIgnoreCase(name) && categoryRepository.existsByNameIgnoreCase(name)) {
			throw ApiException.conflict("This category already exists");
		}
		category.setName(name);
		return Mappers.categoryDto(category);
	}

	@Transactional
	public void delete(Long id) {
		Category category = categoryRepository.findById(id)
				.orElseThrow(() -> ApiException.notFound("Category not found"));
		if (productRepository.countByCategoryId(id) > 0) {
			throw ApiException.conflict("Move or delete the products in this category first");
		}
		categoryRepository.delete(category);
	}
}
