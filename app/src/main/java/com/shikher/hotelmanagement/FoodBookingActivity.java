package com.shikher.hotelmanagement;

import android.os.Bundle;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.Spinner;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.firestore.FirebaseFirestore;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

public class FoodBookingActivity extends AppCompatActivity {

    private Spinner mealSpinner;
    private Button bookBtn;
    private TextView mealTypeLabel, selectedDateLabel;
    private FirebaseAuth mAuth;
    private FirebaseFirestore db;
    private Calendar nextDayCalendar;
    private String[] days = {"Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"};
    private String[] mealTypes = {"breakfast", "lunch", "snacks", "dinner"};
    private Map<String, Map<String, String>> weeklyMenu = new HashMap<>();
    private String selectedMealType = "breakfast";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_food_booking);

        mAuth = FirebaseAuth.getInstance();
        db = FirebaseFirestore.getInstance();

        mealSpinner = findViewById(R.id.mealSpinner);
        bookBtn = findViewById(R.id.bookBtn);
        mealTypeLabel = findViewById(R.id.mealTypeLabel);
        selectedDateLabel = findViewById(R.id.selectedDateLabel);

        // Get next day
        nextDayCalendar = Calendar.getInstance();
        nextDayCalendar.add(Calendar.DAY_OF_YEAR, 1);

        // Load weekly menu and setup spinner
        loadWeeklyMenu();
        bookBtn.setOnClickListener(v -> bookMeal());
    }

    private void loadWeeklyMenu() {
        db.collection("weeklyMenu")
                .document("week1")
                .get()
                .addOnCompleteListener(task -> {
                    if (task.isSuccessful() && task.getResult().exists()) {
                        Map<String, Object> menuData = task.getResult().getData();
                        if (menuData != null) {
                            for (String day : days) {
                                @SuppressWarnings("unchecked")
                                Map<String, String> dayMenu = (Map<String, String>) menuData.get(day);
                                if (dayMenu != null) {
                                    weeklyMenu.put(day, dayMenu);
                                }
                            }
                        }
                    } else {
                        loadDefaultMenu();
                    }
                    updateMenuSpinner();
                });
    }

    private void loadDefaultMenu() {
        // Default menu from Mahalaxmi Hostel's weekly schedule
        String[][] defaultMenuData = {
            {"Sunday", "ब्रेड जैम + चाय", "छोले भटूरे + रायता चावल", "बर्गर + चाय", "चिकन/पनीर + रोटी + चावल + सलाद"},
            {"Monday", "आलू पराठा + चाय + अचार", "दाल सब्जी + पुलाव + चावल + रोटी + सलाद", "समोसा + चाय + चटनी", "दाल फ्राई + मिक्स वेज + चावल + रोटी + सलाद"},
            {"Tuesday", "दलिया + चना फ्राई", "राजमा मसाला + आलू शिमला + रोटी चावल सलाद", "सैंडविच + चाय + सॉस", "आलू टमाटर + पूरी सब्जी + खीर + सलाद"},
            {"Wednesday", "प्लेन पराठा + आलू टमाटर सब्जी + चाय", "छोले रायता जीरा चावल + रोटी सलाद", "पेटीज + चाय", "पनीर + चावल + रोटी + सलाद"},
            {"Thursday", "इडली सांभर + चाय चटनी", "कढ़ी + आलू गोभी + रोटी + चावल + सलाद", "मैकरोनी + चाय", "दाल मखनी + भिंडी सब्जी + रोटी + सलाद"},
            {"Friday", "पूरी आलू सब्जी + चाय", "दाल + सब्जी + रोटी + चावल + सलाद", "पाव भाजी + चाय", "अंडा करी / पनीर + चावल + रोटी + सलाद"},
            {"Saturday", "मिक्स पराठा + चाय + अचार", "बिरयानी + रायता + चटनी", "चाउमिन + चाय", "आलू भुजिया + दाल + रोटी + चावल"}
        };

        for (String[] menuItem : defaultMenuData) {
            String day = menuItem[0];
            Map<String, String> dayMenu = new HashMap<>();
            dayMenu.put("breakfast", menuItem[1]);
            dayMenu.put("lunch", menuItem[2]);
            dayMenu.put("snacks", menuItem[3]);
            dayMenu.put("dinner", menuItem[4]);
            weeklyMenu.put(day, dayMenu);
        }
    }

    private void updateMenuSpinner() {
        int dayOfWeek = nextDayCalendar.get(Calendar.DAY_OF_WEEK) - 1;
        String nextDay = days[dayOfWeek];
        
        // Set date label
        SimpleDateFormat dateFormat = new SimpleDateFormat("MMM dd, yyyy (EEEE)", Locale.getDefault());
        selectedDateLabel.setText("Booking for: " + dateFormat.format(nextDayCalendar.getTime()));

        // Get all available meal options for next day
        Map<String, String> dayMenu = weeklyMenu.getOrDefault(nextDay, new HashMap<>());
        List<String> mealOptions = new ArrayList<>();
        
        // Add all meal types with emoji
        mealOptions.add("🥐 Breakfast: " + dayMenu.getOrDefault("breakfast", "N/A"));
        mealOptions.add("🍛 Lunch: " + dayMenu.getOrDefault("lunch", "N/A"));
        mealOptions.add("🍪 Snacks: " + dayMenu.getOrDefault("snacks", "N/A"));
        mealOptions.add("🍖 Dinner: " + dayMenu.getOrDefault("dinner", "N/A"));

        // Setup spinner adapter
        ArrayAdapter<String> adapter = new ArrayAdapter<>(this, 
                android.R.layout.simple_spinner_item, mealOptions);
        adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
        mealSpinner.setAdapter(adapter);

        // Set default selection to breakfast
        mealSpinner.setSelection(0);
        selectedMealType = "breakfast";
    }

    private void bookMeal() {
        String selectedItem = mealSpinner.getSelectedItem().toString();
        
        // Determine meal type from selection
        if (selectedItem.contains("Breakfast")) selectedMealType = "breakfast";
        else if (selectedItem.contains("Lunch")) selectedMealType = "lunch";
        else if (selectedItem.contains("Snacks")) selectedMealType = "snacks";
        else if (selectedItem.contains("Dinner")) selectedMealType = "dinner";

        // Extract the meal name (everything after the emoji and colon)
        String mealName = selectedItem.substring(selectedItem.indexOf(":") + 2);

        SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd", Locale.getDefault());
        String bookingDate = dateFormat.format(nextDayCalendar.getTime());

        Map<String, Object> booking = new HashMap<>();
        booking.put("userId", mAuth.getCurrentUser().getUid());
        booking.put("email", mAuth.getCurrentUser().getEmail());
        booking.put("mealType", selectedMealType);
        booking.put("mealName", mealName);
        booking.put("date", bookingDate);
        booking.put("status", "confirmed");
        booking.put("bookedAt", new Date());

        db.collection("foodBookings")
                .add(booking)
                .addOnSuccessListener(ref -> {
                    Toast.makeText(FoodBookingActivity.this, 
                            "Meal booked: " + mealName, Toast.LENGTH_SHORT).show();
                    finish();
                })
                .addOnFailureListener(e -> {
                    Toast.makeText(FoodBookingActivity.this, 
                            "Error: " + e.getMessage(), Toast.LENGTH_SHORT).show();
                });
    }
}
