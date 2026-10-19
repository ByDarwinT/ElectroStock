package uce.desarrolloweb.electrostock.Repository;
import org.springframework.data.jpa.repository.JpaRepository;
import uce.desarrolloweb.electrostock.Model.Product;
public interface ProductRepository extends JpaRepository<Product, Long> { }
