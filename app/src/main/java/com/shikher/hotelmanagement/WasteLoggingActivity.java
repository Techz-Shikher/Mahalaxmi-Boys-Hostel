package com.shikher.hotelmanagement;

import android.app.DatePickerDialog;
import android.os.Bundle;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Spinner;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.firestore.FirebaseFirestore;

import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;

public class WasteLoggingActivity extends AppCompatActivity {

    private EditText dateInput, quantityInput, reasonInput;
    private Spinner mealTypeSpinner, wasteCategeorySpinner;
    private Button submitBtn;
    private TextView wasteTitle;
    private FirebaseFirestore db;
    private FirebaseAuth mAuth;
    private Calendar selectedDate;

    private String[] mealTypes = {"Breakfast", "Lunch", "Snacks", "Dinner"};
    private String[] wasteCategories = {"Vegetables", "Grains", "Protein", "Dairy", "Oil", "Other"};

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_waste_logging);

        db = FirebaseFirestore.getInstance();
        mAuth = FirebaseAuth.getInstance();

        // Initialize views
        dateInput = findViewById(R.id.dateInput);
        quantityInput = findViewById(R.id.quantityInput);
        reasonInput = findViewById(R.id.reasonInput);
        mealTypeSpinner = findViewById(R.id.mealTypeSpinner);
        wasteCategeorySpinner = findViewById(R.id.wasteCategeorySpinner);
        submitBtn = findViewById(R.id.submitBtn);
        wasteTitle = findViewById(R.id.wasteTitle);

        selectedDate = Calendar.getInstance();

        // Set today's date as default
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd", Locale.getDefault());
        dateInput.setText(sdf.format(selectedDate.getTime()));

        // Date picker
        dateInput.setOnClickListener(v -> showDatePicker());

        // Setup spinners
        ArrayAdapter<String> mealAdapter = new ArrayAdapter<>(this, android.R.layout.simple_spinner_item, mealTypes);
        mealAdapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
        mealTypeSpinner.setAdapter(mealAdapter);

        ArrayAdapter<String> wasteAdapter = new ArrayAdapter<>(this, android.R.layout.simple_spinner_item, wasteCategories);
        wasteAdapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
        wasteCategeorySpinner.setAdapter(wasteAdapter);

        // Submit button
        submitBtn.setOnClickListener(v -> submitWaste());
    }

    private void showDatePicker() {
        DatePickerDialog datePickerDialog = new DatePickerDialog(
                this,
                (view, year, monthOfYear, dayOfMonth) -> {
                    selectedDate.set(year, monthOfYear, dayOfMonth);
                    SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd", Locale.getDefault());
                    dateInput.setText(sdf.format(selectedDate.getTime()));
                },
                selectedDate.get(Calendar.YEAR),
                selectedDate.get(Calendar.MONTH),
                selectedDate.get(Calendar.DAY_OF_MONTH)
        );
        datePickerDialog.show();
    }

    private void submitWaste() {
        String date = dateInput.getText().toString().trim();
        String mealType = mealTypeSpinner.getSelectedItem().toString();
        String wasteCategory = wasteCategories[wasteCategeorySpinner.getSelectedItemPosition()].toLowerCase();
        String quantityStr = quantityInput.getText().toString().trim();
        String reason = reasonInput.getText().toString().trim();

        if (quantityStr.isEmpty()) {
            Toast.makeText(this, "Please enter waste quantity", Toast.LENGTH_SHORT).show();
            return;
        }

        if (reason.isEmpty()) {
            Toast.makeText(this, "Please provide reason for waste", Toast.LENGTH_SHORT).show();
            return;
        }

        double quantity = Double.parseDouble(quantityStr);

        if (quantity <= 0) {
            Toast.makeText(this, "Quantity must be greater than 0", Toast.LENGTH_SHORT).show();
            return;
        }

        submitBtn.setEnabled(false);
        submitBtn.setText("Logging...");

        Map<String, Object> wasteLog = new HashMap<>();
        wasteLog.put("date", date);
        wasteLog.put("mealType", mealType);
        wasteLog.put("wasteCategory", wasteCategory);
        wasteLog.put("quantityKg", quantity);
        wasteLog.put("reason", reason);
        wasteLog.put("loggedBy", mAuth.getCurrentUser().getEmail());
        wasteLog.put("timestamp", new Date());
        wasteLog.put("userId", mAuth.getCurrentUser().getUid());

        db.collection("wasteTracker")
                .add(wasteLog)
                .addOnSuccessListener(ref -> {
                    Toast.makeText(WasteLoggingActivity.this,
                            "✅ Waste logged successfully!", Toast.LENGTH_SHORT).show();

                    // Reset form
                    dateInput.setText(new SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(new Date()));
                    mealTypeSpinner.setSelection(0);
                    wasteCategeorySpinner.setSelection(0);
                    quantityInput.setText("");
                    reasonInput.setText("");

                    submitBtn.setEnabled(true);
                    submitBtn.setText("Log Waste Entry");
                })
                .addOnFailureListener(e -> {
                    Toast.makeText(WasteLoggingActivity.this,
                            "Error: " + e.getMessage(), Toast.LENGTH_SHORT).show();
                    submitBtn.setEnabled(true);
                    submitBtn.setText("Log Waste Entry");
                });
    }
}
