package uce.desarrolloweb.electrostock.Config;

import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import uce.desarrolloweb.electrostock.Model.Product;
import uce.desarrolloweb.electrostock.Repository.ProductRepository;

@Component
public class DataLoader implements CommandLineRunner {
    private final ProductRepository repository;

    public DataLoader(ProductRepository repository) {
        this.repository = repository;
    }

    @Override
    public void run(String... args) {
        Map<String, String> descriptions = new LinkedHashMap<>();
        descriptions.put("Refrigerator 300L", "300-liter refrigerator with spacious compartments and adjustable shelves. Suitable for everyday food and beverage storage.");
        descriptions.put("Smart TV 50 inch", "50-inch smart television with streaming capabilities and a clear, large screen for movies, series and games.");
        descriptions.put("Washing Machine 18kg", "High-capacity washing machine designed for large laundry loads, with multiple wash programs for different fabrics.");
        descriptions.put("Microwave Oven 25L", "25-liter microwave for reheating, defrosting and preparing everyday meals in a compact countertop format.");
        descriptions.put("Electric Stove 4 Burners", "Electric stove with four cooking zones, ideal for preparing several dishes at the same time.");
        descriptions.put("Blender 1.5L", "1.5-liter countertop blender for smoothies, juices, sauces and everyday food preparation.");
        descriptions.put("Air Fryer 5L", "Five-liter air fryer using circulated hot air for convenient cooking with less added oil.");
        descriptions.put("Vacuum Cleaner", "Household vacuum cleaner for everyday cleaning of floors, rugs and upholstery.");
        descriptions.put("Coffee Maker 12 Cups", "Drip coffee maker with capacity for up to twelve cups, suitable for home or shared office use.");
        descriptions.put("Dishwasher 12 Settings", "Dishwasher with capacity for twelve place settings and practical cleaning programs for dishes and utensils.");
        descriptions.put("Water Dispenser", "Convenient water dispenser for serving drinking water in shared or household spaces.");
        descriptions.put("Electric Kettle 1.7L", "1.7-liter electric kettle for quickly heating water for tea, coffee and other hot beverages.");
        descriptions.put("Toaster 2 Slices", "Compact two-slice toaster designed to prepare toast quickly for breakfast and snacks.");
        descriptions.put("Stand Fan 16 inch", "16-inch standing fan for improved air circulation, with practical placement in living spaces.");
        descriptions.put("Electric Iron", "Household electric iron designed for smoothing wrinkles from everyday clothing and linens.");

        if (repository.count() == 0) {
            addProduct("Refrigerator 300L", "LG", "Refrigerators", "729.99", 8, descriptions);
            addProduct("Smart TV 50 inch", "Samsung", "Televisions", "449.99", 12, descriptions);
            addProduct("Washing Machine 18kg", "Whirlpool", "Washing Machines", "599.00", 6, descriptions);
            addProduct("Microwave Oven 25L", "Mabe", "Microwaves", "139.90", 15, descriptions);
            addProduct("Electric Stove 4 Burners", "Indurama", "Stoves", "359.50", 7, descriptions);
            addProduct("Blender 1.5L", "Oster", "Blenders", "64.99", 20, descriptions);
            addProduct("Air Fryer 5L", "Ninja", "Air Fryers", "129.99", 9, descriptions);
            addProduct("Vacuum Cleaner", "Electrolux", "Vacuum Cleaners", "179.00", 5, descriptions);
            addProduct("Coffee Maker 12 Cups", "Black+Decker", "Coffee Makers", "49.99", 14, descriptions);
            addProduct("Dishwasher 12 Settings", "Bosch", "Dishwashers", "689.00", 4, descriptions);
            addProduct("Water Dispenser", "Midea", "Water Dispensers", "159.00", 10, descriptions);
            addProduct("Electric Kettle 1.7L", "Hamilton Beach", "Kettles", "34.50", 18, descriptions);
            addProduct("Toaster 2 Slices", "Oster", "Toasters", "39.90", 11, descriptions);
            addProduct("Stand Fan 16 inch", "Universal", "Fans", "54.99", 13, descriptions);
            addProduct("Electric Iron", "Philips", "Irons", "44.99", 16, descriptions);
        } else {
            // Add details to existing sample products without changing any other field.
            for (Product product : repository.findAll()) {
                if ((product.getDescription() == null || product.getDescription().isBlank())
                        && descriptions.containsKey(product.getName())) {
                    product.setDescription(descriptions.get(product.getName()));
                    repository.save(product);
                }
            }
        }
    }

    private void addProduct(String name, String brand, String category,
                            String price, int quantity, Map<String, String> descriptions) {
        Product product = new Product();
        product.setName(name);
        product.setBrand(brand);
        product.setCategory(category);
        product.setPrice(new BigDecimal(price));
        product.setQuantity(quantity);
        product.setDescription(descriptions.get(name));
        repository.save(product);
    }
}
