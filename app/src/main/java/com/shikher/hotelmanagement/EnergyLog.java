package com.shikher.hotelmanagement;

import com.google.firebase.Timestamp;

public class EnergyLog {
    private String id;
    private String buildingName;
    private double energyConsumed;
    private String type;
    private String source;
    private Timestamp loggedAt;
    private String loggedBy;

    public EnergyLog() {}

    public EnergyLog(String buildingName, double energyConsumed, String type, String source, Timestamp loggedAt, String loggedBy) {
        this.buildingName = buildingName;
        this.energyConsumed = energyConsumed;
        this.type = type;
        this.source = source;
        this.loggedAt = loggedAt;
        this.loggedBy = loggedBy;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getBuildingName() { return buildingName; }
    public void setBuildingName(String buildingName) { this.buildingName = buildingName; }

    public double getEnergyConsumed() { return energyConsumed; }
    public void setEnergyConsumed(double energyConsumed) { this.energyConsumed = energyConsumed; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }

    public Timestamp getLoggedAt() { return loggedAt; }
    public void setLoggedAt(Timestamp loggedAt) { this.loggedAt = loggedAt; }

    public String getLoggedBy() { return loggedBy; }
    public void setLoggedBy(String loggedBy) { this.loggedBy = loggedBy; }
}
