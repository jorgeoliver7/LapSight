package com.racingteam.model;

public enum VehicleType {
    // COCHES - Fórmula
    FORMULA_1("Fórmula 1", VehicleCategory.CAR),
    FORMULA_2("Fórmula 2", VehicleCategory.CAR),
    FORMULA_3("Fórmula 3", VehicleCategory.CAR),
    FORMULA_4("Fórmula 4", VehicleCategory.CAR),
    FORMULA_FORD("Formula Ford", VehicleCategory.CAR),
    
    // COCHES - GT/Resistencia
    GT3("GT3", VehicleCategory.CAR),
    GT4("GT4", VehicleCategory.CAR),
    LMP("LMP", VehicleCategory.CAR),
    PROTOTYPE("Prototype", VehicleCategory.CAR),
    
    // COCHES - Turismos
    TCR("TCR", VehicleCategory.CAR),
    WTCC("WTCC", VehicleCategory.CAR),
    SUPERCARS("Supercars", VehicleCategory.CAR),
    
    // COCHES - Rally
    WRC("WRC", VehicleCategory.CAR),
    R5("R5", VehicleCategory.CAR),
    HISTORIC_RALLY("Historic Rally", VehicleCategory.CAR),
    
    // COCHES - Monoplazas
    INDYCAR("IndyCar", VehicleCategory.CAR),
    FORMULA_E("Formula E", VehicleCategory.CAR),
    
    // COCHES - Drift/Autocross
    DRIFT_PRO("Drift Pro", VehicleCategory.CAR),
    TIME_ATTACK("Time Attack", VehicleCategory.CAR),
    
    // MOTOS - Circuito
    MOTOGP("MotoGP", VehicleCategory.MOTORCYCLE),
    MOTO2("Moto2", VehicleCategory.MOTORCYCLE),
    MOTO3("Moto3", VehicleCategory.MOTORCYCLE),
    SUPERBIKE("Superbike", VehicleCategory.MOTORCYCLE),
    SUPERSPORT("Supersport", VehicleCategory.MOTORCYCLE),
    
    // MOTOS - Endurance
    EWC("EWC", VehicleCategory.MOTORCYCLE),
    BOL_DOR("Bol d'Or", VehicleCategory.MOTORCYCLE),
    ENDURANCE_24H("24h Endurance", VehicleCategory.MOTORCYCLE),
    
    // MOTOS - Motocross
    MXGP("MXGP", VehicleCategory.MOTORCYCLE),
    MX2("MX2", VehicleCategory.MOTORCYCLE),
    EMX("EMX", VehicleCategory.MOTORCYCLE),
    
    // MOTOS - Enduro
    ENDUROGP("EnduroGP", VehicleCategory.MOTORCYCLE),
    ISDE("ISDE", VehicleCategory.MOTORCYCLE),
    
    // MOTOS - Trial
    TRIALGP("TrialGP", VehicleCategory.MOTORCYCLE),
    TRIAL2("Trial2", VehicleCategory.MOTORCYCLE),
    
    // MOTOS - Velocidad
    NAKED("Naked", VehicleCategory.MOTORCYCLE),
    SPORT("Sport", VehicleCategory.MOTORCYCLE),
    CLASSIC("Classic", VehicleCategory.MOTORCYCLE);

    private final String displayName;
    private final VehicleCategory category;

    VehicleType(String displayName, VehicleCategory category) {
        this.displayName = displayName;
        this.category = category;
    }

    public String getDisplayName() {
        return displayName;
    }

    public VehicleCategory getCategory() {
        return category;
    }

    // Método para obtener todos los tipos de una categoría
    public static VehicleType[] getByCategory(VehicleCategory category) {
        return java.util.Arrays.stream(values())
                .filter(type -> type.getCategory() == category)
                .toArray(VehicleType[]::new);
    }
}