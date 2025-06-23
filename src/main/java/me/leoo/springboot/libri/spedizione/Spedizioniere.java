package me.leoo.springboot.libri.spedizione;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

import java.util.List;

public record Spedizioniere(String id, String displayName, String logoPath,
                            List<TipoSpedizione> offerte,
                            boolean deliverAtLocker, boolean deliverAtPoint,
                            boolean deliverAtHome, boolean programmableDelivery) {

}
