package uce.desarrolloweb.electrostock.Repository;
import org.springframework.data.jpa.repository.JpaRepository;
import uce.desarrolloweb.electrostock.Model.Product;
// Spring Data JPA supplies the standard CRUD methods automatically.
public interface ProductRepository extends JpaRepository<Product, Long> { }
