package com.shikher.hotelmanagement;

import android.os.Bundle;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Spinner;
import android.widget.ArrayAdapter;
import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import com.google.firebase.firestore.FirebaseFirestore;
import com.google.firebase.firestore.Query;
import com.google.firebase.auth.FirebaseAuth;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class CommunityActivity extends AppCompatActivity implements CommunityAdapter.OnCommunityClickListener {

    private RecyclerView communityRecyclerView;
    private CommunityAdapter adapter;
    private EditText postTitleInput;
    private EditText postDescriptionInput;
    private Spinner categorySpinner;
    private Button postButton;
    private FirebaseFirestore db;
    private FirebaseAuth auth;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_community);

        db = FirebaseFirestore.getInstance();
        auth = FirebaseAuth.getInstance();

        initViews();
        setupRecyclerView();
        setupCategorySpinner();
        loadCommunityPosts();

        postButton.setOnClickListener(v -> createPost());
    }

    private void initViews() {
        communityRecyclerView = findViewById(R.id.communityRecyclerView);
        postTitleInput = findViewById(R.id.postTitleInput);
        postDescriptionInput = findViewById(R.id.postDescriptionInput);
        categorySpinner = findViewById(R.id.categorySpinner);
        postButton = findViewById(R.id.postButton);
    }

    private void setupRecyclerView() {
        adapter = new CommunityAdapter(this);
        communityRecyclerView.setLayoutManager(new LinearLayoutManager(this));
        communityRecyclerView.setAdapter(adapter);
    }

    private void setupCategorySpinner() {
        ArrayList<String> categories = new ArrayList<>();
        categories.add("Events");
        categories.add("Discussions");
        categories.add("Lost & Found");
        categories.add("Announcements");

        ArrayAdapter<String> spinnerAdapter = new ArrayAdapter<>(this, 
            android.R.layout.simple_spinner_item, categories);
        spinnerAdapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
        categorySpinner.setAdapter(spinnerAdapter);
    }

    private void loadCommunityPosts() {
        db.collection("community")
            .orderBy("createdAt", Query.Direction.DESCENDING)
            .limit(50)
            .addSnapshotListener((value, error) -> {
                if (error != null) {
                    return;
                }

                List<Community> posts = new ArrayList<>();
                if (value != null) {
                    for (var doc : value.getDocuments()) {
                        Community community = doc.toObject(Community.class);
                        if (community != null) {
                            community.setId(doc.getId());
                            posts.add(community);
                        }
                    }
                }
                adapter.setList(posts);
            });
    }

    private void createPost() {
        String title = postTitleInput.getText().toString().trim();
        String description = postDescriptionInput.getText().toString().trim();
        String category = categorySpinner.getSelectedItem().toString();

        if (title.isEmpty() || description.isEmpty()) {
            return;
        }

        Map<String, Object> post = new HashMap<>();
        post.put("title", title);
        post.put("description", description);
        post.put("category", category);
        post.put("authorId", auth.getCurrentUser().getUid());
        post.put("authorName", auth.getCurrentUser().getDisplayName() != null ? 
            auth.getCurrentUser().getDisplayName() : auth.getCurrentUser().getEmail());
        post.put("createdAt", com.google.firebase.Timestamp.now());
        post.put("likes", 0);
        post.put("comments", 0);

        db.collection("community")
            .add(post)
            .addOnSuccessListener(documentReference -> {
                postTitleInput.setText("");
                postDescriptionInput.setText("");
            })
            .addOnFailureListener(e -> {
                // Handle error
            });
    }

    @Override
    public void onLikeClick(Community community) {
        // Implement like functionality
    }

    @Override
    public void onCommentClick(Community community) {
        // Implement comment functionality
    }
}
