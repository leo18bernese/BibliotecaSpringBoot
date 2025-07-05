package me.leoo.springboot.libri.resi;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ResoRepository extends JpaRepository<Reso, Long> {
}