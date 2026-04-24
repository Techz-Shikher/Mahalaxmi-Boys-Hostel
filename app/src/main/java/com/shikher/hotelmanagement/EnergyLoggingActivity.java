package com.shikher.hotelmanagement;

import android.app.DatePickerDialog;
import android.os.Bundle;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Spinner;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.firestore.FirebaseFirestore;
import com.google.firebase.Timestamp;

import java.util.Calendar;
import java.util.HashMap;
import java.util.Map;

public class EnergyLoggingActivity extends AppCompatActivity {

    private Spinner buildingSpinner, typeSpinner, sourceSpinner;
    private EditText energyInput;
    private Button logButton;
    private FirebaseFirestore db;
    private FirebaseAuth auth;

    private String[] buildings = {"Main Building", "Hostel A", "Hostel B", "Hostel C", "Hostel D", "Kitchen", "Gym", "Library"};
    private String[] types = {"electricity", "gas", "water"};
    private String[] sources = {"grid", "solar", "generator", "hybrid"};

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_energy_logging);

        db = FirebaseFirestore.getInstance();
        auth = FirebaseAuth.getInstance();

        // Initialize views
        buildingSpinner = findViewById(R.id.building_spinner);
        typeSpinner = findViewById(R.id.type_spinner);
        sourceSpinner = findViewById(R.id.source_spinner);
        energyInput = findViewById(R.id.energy_input);
        logButton = findViewById(R.id.log_button);

        // Setup spinners
        ArrayAdapter<String> buildingAdapter = new ArrayAdapter<>(this, android.R.layout.simple_spinner_item, buildings);
        buildingAdapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
        buildingSpinner.setAdapter(buildingAdapter);

        ArrayAdapter<String> typeAdapter = new ArrayAdapter<>(this, android.R.layout.simple_spinner_item, types);
        typeAdapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
        typeSpinner.setAdapter(typeAdapter);

        ArrayAdapter<String> sourceAdapter = new ArrayAdapter<>(this, android.R.layout.simple_spinner_item, sources);
        sourceAdapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
        sourceSpinner.setAdapter(sourceAdapter);

        // Log button click
        logButton.setOnClickListener(v -> submitEnergyLog());
    }

    private void submitEnergyLog() {
        String building = buildingSpinner.getSelectedItem().toString();
        String type = typeSpinner.getSelectedItem().toString();
        String source = sourceSpinner.getSelectedItem().toString();
        String energyStr = energyInput.getText().toString().trim();

        if (building.isEmpty() || energyStr.isEmpty()) {
            Toast.makeText(this, "Please fill in all fields", Toast.LENGTH_SHORT).show();
            return;
        }

        try {
            double energy = Double.parseDouble(energyStr);

            Map<String, Object> log = new HashMap<>();
            log.put("buildingName", building);
            log.put("type", type);
            log.put("source", source);
            log.put("energyConsumed", energy);
            log.put("loggedAt", Timestamp.now());
            log.put("loggedBy", auth.getCurrentUser().getEmail());

            db.collection("energyLogs")
                    .add(log)
                    .addOnSuccessListener(ref -> {
                        Toast.makeText(EnergyLoggingActivity.this, "✅ Energy logged successfully!", Toast.LENGTH_SHORT).show();
                        energyInput.setText("");
                        buildingSpinner.setSelection(0);
                        typeSpinner.setSelection(0);
                        sourceSpinner.setSelection(0);
                    })
                    .addOnFailureListener(e -> {
                        Toast.makeText(EnergyLoggingActivity.this, "❌ Failed to log energy: " + e.getMessage(), Toast.LENGTH_SHORT).show();
                    });
        } catch (NumberFormatException e) {
            Toast.makeText(this, "Please enter a valid number", Toast.LENGTH_SHORT).show();
        }
    }
}
