package com.shikher.hotelmanagement;

import android.app.DatePickerDialog;
import android.os.Bundle;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Spinner;
import android.widget.Toast;
import androidx.appcompat.app.AppCompatActivity;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.firestore.FirebaseFirestore;
import com.google.firebase.firestore.FieldValue;
import com.google.firebase.firestore.ServerTimestamp;
import java.util.Calendar;
import java.util.HashMap;
import java.util.Map;

public class HealthIncidentReportingActivity extends AppCompatActivity {

    private EditText descriptionInput;
    private Spinner incidentTypeSpinner, severitySpinner;
    private Button submitBtn;
    private FirebaseAuth mAuth;
    private FirebaseFirestore db;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_health_incident_reporting);

        mAuth = FirebaseAuth.getInstance();
        db = FirebaseFirestore.getInstance();

        descriptionInput = findViewById(R.id.descriptionInput);
        incidentTypeSpinner = findViewById(R.id.incidentTypeSpinner);
        severitySpinner = findViewById(R.id.severitySpinner);
        submitBtn = findViewById(R.id.submitBtn);

        // Set up spinners
        setupSpinners();

        // Submit button click listener
        submitBtn.setOnClickListener(view -> submitHealthIncident());
    }

    private void setupSpinners() {
        // Incident types: Fever/Cold, Injury, Allergy, Nutrition, Mental Health, Other
        String[] incidentTypes = {"Select Type...", "Fever/Cold", "Injury", "Allergy", "Nutrition Issue", "Mental Health", "Other"};
        String[] severities = {"Low", "Medium", "High", "Critical"};

        // You would normally use ArrayAdapter here
        // For this demo, spinners are configured via UI
    }

    private void submitHealthIncident() {
        String description = descriptionInput.getText().toString().trim();
        String incidentType = incidentTypeSpinner.getSelectedItem().toString();
        String severity = severitySpinner.getSelectedItem().toString();

        // Validation
        if (description.isEmpty()) {
            Toast.makeText(this, "Please describe your health issue", Toast.LENGTH_SHORT).show();
            return;
        }

        if (incidentType.equals("Select Type...")) {
            Toast.makeText(this, "Please select an incident type", Toast.LENGTH_SHORT).show();
            return;
        }

        // Create health incident document
        Map<String, Object> healthIncident = new HashMap<>();
        healthIncident.put("studentId", mAuth.getCurrentUser().getUid());
        healthIncident.put("studentName", mAuth.getCurrentUser().getDisplayName());
        healthIncident.put("studentEmail", mAuth.getCurrentUser().getEmail());
        healthIncident.put("incidentType", incidentType.toLowerCase().replace("/", "").replace(" ", ""));
        healthIncident.put("severity", severity);
        healthIncident.put("description", description);
        healthIncident.put("symptoms", new String[]{}); // Empty for now, can be enhanced
        healthIncident.put("status", "Reported");
        healthIncident.put("reportedAt", FieldValue.serverTimestamp());

        // Submit to Firestore
        db.collection("healthIncidents")
                .add(healthIncident)
                .addOnSuccessListener(documentReference -> {
                    Toast.makeText(HealthIncidentReportingActivity.this,
                            "✅ Health incident reported! Admin will review shortly.",
                            Toast.LENGTH_SHORT).show();
                    // Clear form
                    descriptionInput.setText("");
                    finish();
                })
                .addOnFailureListener(e -> {
                    Toast.makeText(HealthIncidentReportingActivity.this,
                            "❌ Failed to report incident: " + e.getMessage(),
                            Toast.LENGTH_SHORT).show();
                });
    }
}
