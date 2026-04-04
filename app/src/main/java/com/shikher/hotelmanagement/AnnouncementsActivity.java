package com.shikher.hotelmanagement;

import android.os.Bundle;

import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.google.firebase.firestore.FirebaseFirestore;
import com.google.firebase.firestore.QueryDocumentSnapshot;

import java.util.ArrayList;
import java.util.List;

public class AnnouncementsActivity extends AppCompatActivity {

    private RecyclerView announcementsList;
    private FirebaseFirestore db;
    private List<Announcement> announcements = new ArrayList<>();
    private AnnouncementAdapter adapter;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_announcements);

        db = FirebaseFirestore.getInstance();
        announcementsList = findViewById(R.id.announcementsList);

        adapter = new AnnouncementAdapter(announcements);
        announcementsList.setLayoutManager(new LinearLayoutManager(this));
        announcementsList.setAdapter(adapter);

        loadAnnouncements();
    }

    private void loadAnnouncements() {
        db.collection("announcements")
                .orderBy("timestamp", com.google.firebase.firestore.Query.Direction.DESCENDING)
                .limit(50)
                .get()
                .addOnCompleteListener(task -> {
                    if (task.isSuccessful()) {
                        announcements.clear();
                        for (QueryDocumentSnapshot doc : task.getResult()) {
                            String title = doc.getString("title");
                            String content = doc.getString("content");
                            if (title != null && content != null) {
                                announcements.add(new Announcement(title, content));
                            }
                        }
                        adapter.notifyDataSetChanged();
                    }
                });
    }
}
