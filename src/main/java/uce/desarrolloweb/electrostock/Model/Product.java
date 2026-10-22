package uce.desarrolloweb.electrostock.Model;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
// JPA maps this entity to the PostgreSQL products table.
@Entity
@Table(name = "products")
public class Product {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @NotBlank @Size(max=100)
    private String name;
    @NotBlank @Size(max=50)
    private String brand;
    @NotBlank @Size(max=50)
    private String category;
    @NotNull @DecimalMin("0.0") @Digits(integer=8, fraction=2)
    @Column(precision=10, scale=2)
    private BigDecimal price;
    @NotNull @Min(0)
    private Integer quantity;
    @Column(length = 1500)
    private String description;
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Long getId() { return id; }
    public void setId(Long id) { this.id=id; }
    public String getName() { return name; }
    public void setName(String name) { this.name=name; }
    public String getBrand() { return brand; }
    public void setBrand(String brand) { this.brand=brand; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category=category; }
    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price=price; }
    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity=quantity; }
}
