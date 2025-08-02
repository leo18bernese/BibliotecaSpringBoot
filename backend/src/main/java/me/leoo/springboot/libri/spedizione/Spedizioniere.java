package me.leoo.springboot.libri.spedizione;

import me.leoo.springboot.libri.libri.miscellaneous.DeliveryPackage;

import java.util.List;

public record Spedizioniere(String id, String displayName, String logoPath,
                            List<TipoSpedizione> offerte,
                            List<DeliveryPackage> formati,
                            boolean deliverAtLocker,
                            boolean deliverAtPoint,
                            boolean deliverAtHome,
                            boolean programmableDelivery) {

}
