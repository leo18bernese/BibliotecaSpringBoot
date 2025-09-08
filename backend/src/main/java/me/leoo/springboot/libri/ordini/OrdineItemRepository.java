package me.leoo.springboot.libri.ordini;

import org.springframework.data.jpa.repository.JpaRepository;

public interface OrdineItemRepository extends JpaRepository<OrdineItem, Long> {

}
