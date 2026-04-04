package com.shikher.hotelmanagement;

import android.os.Bundle;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.Spinner;
import android.widget.TextView;
import android.widget.Toast;
import android.view.View;

import androidx.appcompat.app.AppCompatActivity;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.firestore.FirebaseFirestore;

import java.util.HashMap;
import java.util.Map;
import java.util.Date;

public class TransportActivity extends AppCompatActivity {

    private Spinner universitySpinner;
    private Spinner goingTimeSpinner;
    private Spinner departureTimeSpinner;
    private TextView goingTimeLabel;
    private TextView departureTimeLabel;
    private Button requestBtn;
    private FirebaseAuth mAuth;
    private FirebaseFirestore db;

    private String selectedUniversity = "";
    private String selectedGoingTime = "";
    private String selectedDepartureTime = "";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_transport);

        mAuth = FirebaseAuth.getInstance();
        db = FirebaseFirestore.getInstance();

        // Initialize views
        universitySpinner = findViewById(R.id.universitySpinner);
        goingTimeSpinner = findViewById(R.id.goingTimeSpinner);
        departureTimeSpinner = findViewById(R.id.departureTimeSpinner);
        goingTimeLabel = findViewById(R.id.goingTimeLabel);
        departureTimeLabel = findViewById(R.id.departureTimeLabel);
        requestBtn = findViewById(R.id.requestBtn);

        // Setup university spinner
        ArrayAdapter<CharSequence> universityAdapter = ArrayAdapter.createFromResource(this,
                R.array.destinations, android.R.layout.simple_spinner_item);
        universityAdapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
        universitySpinner.setAdapter(universityAdapter);

        // Set up university spinner listener
        universitySpinner.setOnItemSelectedListener(new android.widget.AdapterView.OnItemSelectedListener() {
            @Override
            public void onItemSelected(android.widget.AdapterView<?> parent, View view, int position, long id) {
                selectedUniversity = parent.getItemAtPosition(position).toString();
                updateTimeSpinners(selectedUniversity);
            }

            @Override
            public void onNothingSelected(android.widget.AdapterView<?> parent) {
                // Handle nothing selected
            }
        });

        // Setup going time spinner listener
        goingTimeSpinner.setOnItemSelectedListener(new android.widget.AdapterView.OnItemSelectedListener() {
            @Override
            public void onItemSelected(android.widget.AdapterView<?> parent, View view, int position, long id) {
                selectedGoingTime = parent.getItemAtPosition(position).toString();
            }

            @Override
            public void onNothingSelected(android.widget.AdapterView<?> parent) {
                // Handle nothing selected
            }
        });

        // Setup departure time spinner listener
        departureTimeSpinner.setOnItemSelectedListener(new android.widget.AdapterView.OnItemSelectedListener() {
            @Override
            public void onItemSelected(android.widget.AdapterView<?> parent, View view, int position, long id) {
                selectedDepartureTime = parent.getItemAtPosition(position).toString();
            }

            @Override
            public void onNothingSelected(android.widget.AdapterView<?> parent) {
                // Handle nothing selected
            }
        });

        requestBtn.setOnClickListener(v -> requestTransport());
    }

    private void updateTimeSpinners(String university) {
        int goingTimesResId;
        int departureTimesResId;

        if ("Galgotias University".equals(university)) {
            goingTimesResId = R.array.galgotias_going_times;
            departureTimesResId = R.array.galgotias_departure_times;
        } else if ("Local".equals(university)) {
            goingTimesResId = R.array.local_going_times;
            departureTimesResId = R.array.local_departure_times;
        } else {
            // Default or handle other cases
            goingTimesResId = R.array.galgotias_going_times;
            departureTimesResId = R.array.galgotias_departure_times;
        }

        // Setup going time spinner
        ArrayAdapter<CharSequence> goingAdapter = ArrayAdapter.createFromResource(this,
                goingTimesResId, android.R.layout.simple_spinner_item);
        goingAdapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
        goingTimeSpinner.setAdapter(goingAdapter);

        // Setup departure time spinner
        ArrayAdapter<CharSequence> departureAdapter = ArrayAdapter.createFromResource(this,
                departureTimesResId, android.R.layout.simple_spinner_item);
        departureAdapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
        departureTimeSpinner.setAdapter(departureAdapter);

        // Show time spinners and labels
        goingTimeLabel.setVisibility(View.VISIBLE);
        goingTimeSpinner.setVisibility(View.VISIBLE);
        departureTimeLabel.setVisibility(View.VISIBLE);
        departureTimeSpinner.setVisibility(View.VISIBLE);
    }

    private void requestTransport() {
        if (selectedUniversity.isEmpty() || selectedGoingTime.isEmpty() || selectedDepartureTime.isEmpty()) {
            Toast.makeText(TransportActivity.this, "Please select all fields", Toast.LENGTH_SHORT).show();
            return;
        }

        Map<String, Object> request = new HashMap<>();
        request.put("email", mAuth.getCurrentUser().getEmail());
        request.put("destination", selectedUniversity);
        request.put("time", selectedGoingTime + " - " + selectedDepartureTime);
        request.put("date", new Date());
        request.put("status", "pending");

        db.collection("transportRequests")
                .add(request)
                .addOnSuccessListener(ref -> {
                    Toast.makeText(TransportActivity.this, "Request sent to: " + selectedUniversity, Toast.LENGTH_SHORT).show();
                    finish();
                })
                .addOnFailureListener(e -> {
                    Toast.makeText(TransportActivity.this, "Error: " + e.getMessage(), Toast.LENGTH_SHORT).show();
                });
    }
}
