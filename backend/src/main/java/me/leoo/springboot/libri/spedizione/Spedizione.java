package me.leoo.springboot.libri.spedizione;

import lombok.Getter;
import me.leoo.springboot.libri.libri.miscellaneous.DeliveryPackage;

import java.util.ArrayList;
import java.util.List;

public class Spedizione {

    @Getter
    private static final List<Spedizioniere> corrieri = new ArrayList<>();

    static {
        corrieri.add(new Spedizioniere("BRT", "BRT Corriere Espresso", "brt/logo.png",
                List.of(
                        new TipoSpedizione(TipoSpedizione.Tipo.STANDARD, 5, 3, 5),
                        new TipoSpedizione(TipoSpedizione.Tipo.EXPRESS, 10, 1, 2)
                        //new TipoSpedizione(TipoSpedizione.Tipo.PRIORITY, 15, 1, 1)
                ),
                List.of(DeliveryPackage.SMALL, DeliveryPackage.MEDIUM, DeliveryPackage.LARGE),
                false, true, true, true));

        corrieri.add(new Spedizioniere("SDA", "SDA Corriere Espresso (Poste)", "sda/logo.png",
                List.of(
                        new TipoSpedizione(TipoSpedizione.Tipo.STANDARD, 4, 3, 5),
                        new TipoSpedizione(TipoSpedizione.Tipo.EXPRESS, 8, 1, 2)
                        //new TipoSpedizione(TipoSpedizione.Tipo.PRIORITY, 12, 1, 1)
                        ),
                List.of(DeliveryPackage.SMALL, DeliveryPackage.MEDIUM),
                true, false, true, false));

        corrieri.add(new Spedizioniere("GLS", "GLS Corriere Espresso", "gls/logo.png",
                List.of(
                        new TipoSpedizione(TipoSpedizione.Tipo.STANDARD, 6, 3, 5),
                        new TipoSpedizione(TipoSpedizione.Tipo.EXPRESS, 11, 1, 2)
                        //new TipoSpedizione(TipoSpedizione.Tipo.PRIORITY, 16, 1, 1)
                ),
                List.of(DeliveryPackage.SMALL, DeliveryPackage.MEDIUM, DeliveryPackage.LARGE),
                false, true, true, true));

        corrieri.add(new Spedizioniere("DHL", "DHL Express", "dhl/logo.png",
                List.of(
                        new TipoSpedizione(TipoSpedizione.Tipo.STANDARD, 7, 3, 5),
                        new TipoSpedizione(TipoSpedizione.Tipo.EXPRESS, 12, 1, 2)
                        //new TipoSpedizione(TipoSpedizione.Tipo.PRIORITY, 18, 1, 1)
                ),
                List.of(DeliveryPackage.SMALL, DeliveryPackage.MEDIUM, DeliveryPackage.LARGE, DeliveryPackage.EXTRA_LARGE),
                true, true, true, true));

        corrieri.add(new Spedizioniere("INPOST", "INPOST Locker", "inpost/logo.png",
                List.of(
                        new TipoSpedizione(TipoSpedizione.Tipo.STANDARD, 3, 3, 5),
                        new TipoSpedizione(TipoSpedizione.Tipo.EXPRESS, 6, 1, 2)
                        //new TipoSpedizione(TipoSpedizione.Tipo.PRIORITY, 9, 1, 1)
                ),
                List.of(DeliveryPackage.SMALL, DeliveryPackage.MEDIUM),
                true, true, false, false));
    }

    public static Spedizioniere getById(String id) {
        return corrieri.stream()
                .filter(spedizioniere -> spedizioniere.id().equalsIgnoreCase(id))
                .findFirst()
                .orElse(null);
    }

    public static List<Spedizioniere> getByType(SpedizioneLuogo luogo) {
        return corrieri.stream()
                .filter(spedizioniere -> switch (luogo) {
                    case HOME -> spedizioniere.deliverAtHome();
                    case LOCKER -> spedizioniere.deliverAtLocker();
                    case POINT -> spedizioniere.deliverAtPoint();
                })
                .toList();
    }
}
