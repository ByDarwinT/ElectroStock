package uce.desarrolloweb.electrostock.Service;
import java.util.List;
import org.springframework.stereotype.Service;
import uce.desarrolloweb.electrostock.Model.Product;
import uce.desarrolloweb.electrostock.Repository.ProductRepository;
@Service
public class ProductService {
    private final ProductRepository repository;
    public ProductService(ProductRepository repository) { this.repository=repository; }
    public List<Product> findAll() { return repository.findAll(); }
    public Product findById(Long id) { return repository.findById(id).orElse(null); }
    public Product save(Product product) { return repository.save(product); }
    public void delete(Long id) { if(repository.existsById(id)) repository.deleteById(id); }
}
