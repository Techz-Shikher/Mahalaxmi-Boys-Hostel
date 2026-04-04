package com.shikher.hotelmanagement;

import android.os.Bundle;
import android.widget.TableLayout;
import android.widget.TableRow;
import android.widget.TextView;
import androidx.appcompat.app.AppCompatActivity;
import androidx.cardview.widget.CardView;
import com.google.firebase.firestore.FirebaseFirestore;
import com.google.firebase.firestore.QueryDocumentSnapshot;
import java.util.HashMap;
import java.util.Map;

public class MenuActivity extends AppCompatActivity {

    private TableLayout menuTableLayout;
    private FirebaseFirestore db;
    private String[] days = {"Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"};
    private String[] mealTypes = {"Breakfast", "Lunch", "Snacks", "Dinner"};
    private Map<String, Map<String, String>> weeklyMenu = new HashMap<>();

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_menu);

        db = FirebaseFirestore.getInstance();
        menuTableLayout = findViewById(R.id.menuTableLayout);

        loadMenuFromFirestore();
    }

    private void loadMenuFromFirestore() {
        db.collection("weeklyMenu")
                .document("week1")
                .get()
                .addOnCompleteListener(task -> {
                    if (task.isSuccessful() && task.getResult().exists()) {
                        weeklyMenu.clear();
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
                        
                        displayMenu();
                    } else {
                        // Use default menu if not in Firestore
                        loadDefaultMenu();
                        displayMenu();
                    }
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

        for (int i = 0; i < defaultMenuData.length; i++) {
            String day = defaultMenuData[i][0];
            Map<String, String> dayMenu = new HashMap<>();
            dayMenu.put("breakfast", defaultMenuData[i][1]);
            dayMenu.put("lunch", defaultMenuData[i][2]);
            dayMenu.put("snacks", defaultMenuData[i][3]);
            dayMenu.put("dinner", defaultMenuData[i][4]);
            weeklyMenu.put(day, dayMenu);
        }
    }

    private void displayMenu() {
        menuTableLayout.removeAllViews();

        // Header Row
        TableRow headerRow = new TableRow(this);
        headerRow.setLayoutParams(new TableLayout.LayoutParams(
                TableLayout.LayoutParams.MATCH_PARENT,
                TableLayout.LayoutParams.WRAP_CONTENT));
        
        String[] headers = {"", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"};
        for (String header : headers) {
            TextView tv = createHeaderCell(header);
            headerRow.addView(tv);
        }
        menuTableLayout.addView(headerRow);

        // Meal type rows
        for (String mealType : mealTypes) {
            TableRow mealRow = new TableRow(this);
            mealRow.setLayoutParams(new TableLayout.LayoutParams(
                    TableLayout.LayoutParams.MATCH_PARENT,
                    TableLayout.LayoutParams.WRAP_CONTENT));

            // Meal type label
            TextView mealTypeTV = createMealTypeCell(mealType);
            mealRow.addView(mealTypeTV);

            // Each day's meal
            for (String day : days) {
                Map<String, String> dayMenu = weeklyMenu.getOrDefault(day, new HashMap<>());
                String mealContent = dayMenu.getOrDefault(mealType.toLowerCase(), "N/A");
                TextView tv = createMenuCell(mealContent);
                mealRow.addView(tv);
            }

            menuTableLayout.addView(mealRow);
        }
    }

    private TextView createHeaderCell(String text) {
        TextView tv = new TextView(this);
        tv.setText(text);
        tv.setTextColor(0xFF1a1a1a);
        tv.setTextSize(11);
        tv.setTypeface(null, android.graphics.Typeface.BOLD);
        tv.setBackgroundColor(0xFF5b6ef5);
        tv.setTextColor(0xFFFFFFFF);
        tv.setPadding(12, 12, 12, 12);
        tv.setLayoutParams(new TableRow.LayoutParams(120, TableRow.LayoutParams.WRAP_CONTENT));
        return tv;
    }

    private TextView createMealTypeCell(String text) {
        TextView tv = new TextView(this);
        tv.setText(text);
        tv.setTextSize(10);
        tv.setTypeface(null, android.graphics.Typeface.BOLD);
        tv.setBackgroundColor(0xFFe8e8e8);
        tv.setTextColor(0xFF333333);
        tv.setPadding(12, 12, 12, 12);
        tv.setLayoutParams(new TableRow.LayoutParams(100, TableRow.LayoutParams.WRAP_CONTENT));
        return tv;
    }

    private TextView createMenuCell(String text) {
        TextView tv = new TextView(this);
        tv.setText(text);
        tv.setTextSize(9);
        tv.setTextColor(0xFF555555);
        tv.setPadding(8, 8, 8, 8);
        tv.setLayoutParams(new TableRow.LayoutParams(120, TableRow.LayoutParams.WRAP_CONTENT));
        tv.setBackgroundColor(0xFFffffff);
        tv.setLineSpacing(0, 1.1f);
        return tv;
    }
}
