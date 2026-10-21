package com.example.ecommerce.config;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.example.ecommerce.entity.Category;
import com.example.ecommerce.entity.Product;
import com.example.ecommerce.entity.Role;
import com.example.ecommerce.entity.User;
import com.example.ecommerce.repository.CategoryRepository;
import com.example.ecommerce.repository.ProductRepository;
import com.example.ecommerce.repository.UserRepository;

/**
 * Runs once at start-up. Creates the admin account and a sample catalog, but only when the
 * database is empty, so restarting never creates duplicates (important for MySQL).
 *
 * Product photos are links to Unsplash (free to use). If a link ever stops working, the shop
 * shows a neat placeholder instead; the admin can paste a new link in Admin > Products.
 */
@Component
public class DataSeeder implements CommandLineRunner {

	private static final String PHOTO = "https://images.unsplash.com/photo-%s?auto=format&fit=crop&w=800&q=80";

	private final UserRepository userRepository;
	private final CategoryRepository categoryRepository;
	private final ProductRepository productRepository;
	private final PasswordEncoder passwordEncoder;

	@Value("${app.seed.enabled:true}")
	private boolean enabled;
	@Value("${app.admin.name}")
	private String adminName;
	@Value("${app.admin.email}")
	private String adminEmail;
	@Value("${app.admin.password}")
	private String adminPassword;

	public DataSeeder(UserRepository userRepository, CategoryRepository categoryRepository,
			ProductRepository productRepository, PasswordEncoder passwordEncoder) {
		this.userRepository = userRepository;
		this.categoryRepository = categoryRepository;
		this.productRepository = productRepository;
		this.passwordEncoder = passwordEncoder;
	}

	@Override
	public void run(String... args) {
		if (!enabled) {
			return;
		}
		seedAdmin();
		if (categoryRepository.count() == 0 && productRepository.count() == 0) {
			seedCatalog();
		}
	}

	private void seedAdmin() {
		if (userRepository.existsByRole(Role.ADMIN)) {
			return;
		}
		User admin = new User();
		admin.setName(adminName);
		admin.setEmail(adminEmail.trim().toLowerCase());
		admin.setPassword(passwordEncoder.encode(adminPassword));
		admin.setRole(Role.ADMIN);
		userRepository.save(admin);
	}

	private void seedCatalog() {
		Map<String, Category> cat = new HashMap<>();
		for (String name : new String[] { "Electronics", "Fashion", "Home & Kitchen", "Sports & Fitness",
				"Beauty & Care", "Stationery" }) {
			cat.put(name, categoryRepository.save(new Category(name)));
		}

		// Electronics
		add(cat.get("Electronics"), "SoundWave Wireless Headphones", "SoundWave", "2999", "4499", 40,
				"1505740420928-5e560c06d30e", true,
				"Over-ear Bluetooth headphones with deep bass, soft ear cushions and long battery life.");
		add(cat.get("Electronics"), "FitPulse Smartwatch", "FitPulse", "4999", "7999", 25,
				"1579586337278-3befd40fd17a", true,
				"Bright touch display with heart-rate and sleep tracking, and multi-day battery life.");
		add(cat.get("Electronics"), "AeroBook 14 Laptop", "AeroBook", "54999", "64999", 12,
				"1496181133206-80ce9b88a853", true,
				"Slim 14-inch laptop for work and study with a fast SSD, 16 GB RAM and all-day battery.");
		add(cat.get("Electronics"), "BoomBox Portable Speaker", "BoomBox", "1999", "2999", 60,
				"1608043152269-423dbba4e7e1", false,
				"Water-resistant Bluetooth speaker with punchy sound for the beach, the park or your desk.");
		add(cat.get("Electronics"), "Slim Wireless Keyboard", "KeyCraft", "2199", "2999", 35,
				"1587829741301-dc798b83add3", false,
				"Quiet low-profile keys, Bluetooth pairing and a rechargeable battery that lasts for weeks.");

		// Fashion
		add(cat.get("Fashion"), "Classic White Sneakers", "Strideline", "2499", "3499", 50,
				"1608229751021-ed4bd8677753", true,
				"Clean white sneakers with a cushioned sole that go with jeans, shorts and everything else.");
		add(cat.get("Fashion"), "Urban Leather Backpack", "Northbound", "3299", "4999", 20,
				"1622560480605-d83c853bc5c3", true,
				"Roomy backpack in soft faux leather with a padded sleeve that fits a 15-inch laptop.");
		add(cat.get("Fashion"), "Wayfarer Sunglasses", "Solace", "1299", "1999", 80,
				"1572635196237-14b3f281503f", false,
				"Timeless wayfarer frame with UV400 lenses to protect your eyes on bright days.");
		add(cat.get("Fashion"), "Classic Denim Jacket", "Indigo & Co", "2799", "3999", 30,
				"1611312449408-fcece27cdbb7", false,
				"Washed blue denim jacket with a relaxed fit that layers over anything.");
		add(cat.get("Fashion"), "Everyday Pullover Hoodie", "Cozyline", "1599", "2299", 45,
				"1556821840-3a63f95609a7", false,
				"Soft brushed-cotton hoodie with a roomy front pocket for lazy weekends.");

		// Home & Kitchen
		add(cat.get("Home & Kitchen"), "BrewMaster Coffee Maker", "BrewMaster", "3499", "4999", 18,
				"1608354580875-30bd4168b351", true,
				"Programmable drip coffee maker with a glass carafe and a keep-warm plate.");
		add(cat.get("Home & Kitchen"), "Nordic Table Lamp", "Lumo", "1799", "2499", 28,
				"1517991104123-1d56a6e81ed9", false,
				"Warm-light bedside lamp with a wooden base and a soft fabric shade.");
		add(cat.get("Home & Kitchen"), "Ceramic Mug Set (Set of 2)", "Hearth", "699", "999", 100,
				"1590422749897-47036da0b0ff", false,
				"Smooth glazed ceramic mugs that keep your tea and coffee warm and look great on a shelf.");
		add(cat.get("Home & Kitchen"), "Potted Indoor Plant", "GreenLeaf", "899", "1199", 22,
				"1622673037864-696ef5f6a8a1", false,
				"Low-maintenance leafy plant in a glazed ceramic pot to brighten your desk or shelf.");

		// Sports & Fitness
		add(cat.get("Sports & Fitness"), "ProGrip Yoga Mat", "FlexFit", "999", "1499", 70,
				"1646239646963-b0b9be56d6b5", true,
				"Non-slip yoga mat with extra cushioning for floor workouts, stretching and meditation.");
		add(cat.get("Sports & Fitness"), "Hex Dumbbell Set (2 x 5 kg)", "IronCore", "2299", "3199", 26,
				"1638536532686-d610adfc8e5c", false,
				"Rubber-coated hex dumbbells that will not roll away, ideal for home strength training.");
		add(cat.get("Sports & Fitness"), "AirRun Running Shoes", "AirRun", "3999", "5499", 38,
				"1542291026-7eec264c27ff", false,
				"Lightweight running shoes with a cushioned sole and a breathable mesh upper.");
		add(cat.get("Sports & Fitness"), "Insulated Steel Water Bottle", "HydroKeep", "799", "1199", 90,
				"1602143407151-7111542de6e8", false,
				"Double-wall steel bottle that keeps drinks cold for hours or hot through the morning.");

		// Beauty & Care
		add(cat.get("Beauty & Care"), "Glow Vitamin C Serum", "Dermaglow", "899", "1299", 55,
				"1576426863848-c21f53c60b19", false,
				"Brightening face serum in a dropper bottle for a fresh, even-looking glow.");
		add(cat.get("Beauty & Care"), "Midnight Eau de Parfum", "Maison Noir", "2499", "3499", 24,
				"1594035910387-fea47794261f", true,
				"A warm, woody fragrance with amber and musk notes in a black-and-gold bottle.");
		add(cat.get("Beauty & Care"), "Velvet Matte Lipstick Trio", "Rosette", "599", "899", 75,
				"1773372238338-f26460145162", false,
				"Three richly pigmented matte shades with a comfortable, long-wearing finish.");
		add(cat.get("Beauty & Care"), "Hydra Night Cream", "Dermaglow", "749", "999", 48,
				"1786171128252-716f3915293d", false,
				"Rich overnight moisturiser that leaves skin soft and hydrated by morning.");

		// Stationery
		add(cat.get("Stationery"), "Premium Lined Journal", "Paperly", "499", "699", 120,
				"1591195852468-03a01d1375d6", false,
				"Hardcover journal with thick, smooth lined pages that take ink without bleeding.");
		add(cat.get("Stationery"), "Classic Fountain Pen", "Inkwell", "1499", "1999", 40,
				"1518674660708-0e2c0473e68e", false,
				"Gold-trimmed fountain pen with a smooth nib that makes everyday writing a pleasure.");
		add(cat.get("Stationery"), "Colored Pencil Set (24)", "ArtBox", "349", "499", 150,
				"1513542789411-b6a5d4f31634", false,
				"Twenty-four vivid, easy-blending colored pencils for sketching and colouring.");
		add(cat.get("Stationery"), "Spiral Sketch Notebook", "Paperly", "299", "449", 130,
				"1531346878377-a5be20888e57", false,
				"Spiral-bound notebook that lies flat for notes, sketches and quick ideas.");
	}

	private void add(Category category, String name, String brand, String price, String mrp, int stock, String photoId,
			boolean featured, String description) {
		Product p = new Product();
		p.setCategory(category);
		p.setName(name);
		p.setBrand(brand);
		p.setPrice(new BigDecimal(price));
		p.setMrp(new BigDecimal(mrp));
		p.setStock(stock);
		p.setImageUrl(String.format(PHOTO, photoId));
		p.setFeatured(featured);
		p.setDescription(description);
		productRepository.save(p);
	}
}
