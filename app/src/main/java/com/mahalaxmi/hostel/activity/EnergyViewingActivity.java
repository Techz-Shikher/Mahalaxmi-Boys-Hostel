package com.mahalaxmi.hostel.activity;

import android.os.Bundle;
import android.widget.ListView;
import android.widget.ProgressBar;
import android.widget.TextView;

import androidx.appcompat.app.AppCompatActivity;

import com.google.firebase.firestore.FirebaseFirestore;
import com.google.firebase.firestore.QuerySnapshot;
import com.mahalaxmi.hostel.R;
import com.mahalaxmi.hostel.adapter.EnergyLogAdapter;
import com.mahalaxmi.hostel.model.EnergyLog;

import java.util.ArrayList;
import java.util.List;

public class EnergyViewingActivity extends AppCompatActivity {

    private ListView logsListView;
    private ProgressBar progressBar;
    private TextView emptyMessage;
    private EnergyLogAdapter adapter;
    private List<EnergyLog> energyLogs;
    private FirebaseFirestore db;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_energy_viewing);

        db = FirebaseFirestore.getInstance();

        // Initialize views
        logsListView = findViewById(R.id.logs_list);
        progressBar = findViewById(R.id.progress_bar);
        emptyMessage = findViewById(R.id.empty_message);

        energyLogs = new ArrayList<>();
        adapter = new EnergyLogAdapter(this, energyLogs);
        logsListView.setAdapter(adapter);

        fetchEnergyLogs();
    }

    private void fetchEnergyLogs() {
        progressBar.setVisibility(android.view.View.VISIBLE);

        db.collection("energyLogs")
                .orderBy("loggedAt", com.google.firebase.firestore.Query.Direction.DESCENDING)
                .limit(100)
                .get()
                .addOnSuccessListener((QuerySnapshot snapshot) -> {
                    energyLogs.clear();
                    snapshot.forEach(doc -> {
                        EnergyLog log = doc.toObject(EnergyLog.class);
                        log.setId(doc.getId());
                        energyLogs.add(log);
                    });

                    adapter.notifyDataSetChanged();
                    progressBar.setVisibility(android.view.View.GONE);

                    if (energyLogs.isEmpty()) {
                        emptyMessage.setVisibility(android.view.View.VISIBLE);
                    } else {
                        emptyMessage.setVisibility(android.view.View.GONE);
                    }
                })
                .addOnFailureListener(e -> {
                    progressBar.setVisibility(android.view.View.GONE);
                    emptyMessage.setText("❌ Failed to load energy logs");
                    emptyMessage.setVisibility(android.view.View.VISIBLE);
                });
    }
}
