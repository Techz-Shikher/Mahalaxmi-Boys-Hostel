package com.shikher.hotelmanagement;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;
import android.widget.ImageButton;
import androidx.recyclerview.widget.RecyclerView;
import java.util.ArrayList;
import java.util.List;

public class CommunityAdapter extends RecyclerView.Adapter<CommunityAdapter.CommunityViewHolder> {

    private List<Community> communityList = new ArrayList<>();
    private OnCommunityClickListener listener;

    public interface OnCommunityClickListener {
        void onLikeClick(Community community);
        void onCommentClick(Community community);
    }

    public CommunityAdapter(OnCommunityClickListener listener) {
        this.listener = listener;
    }

    @Override
    public CommunityViewHolder onCreateViewHolder(ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext())
                .inflate(R.layout.item_community, parent, false);
        return new CommunityViewHolder(view);
    }

    @Override
    public void onBindViewHolder(CommunityViewHolder holder, int position) {
        Community community = communityList.get(position);
        holder.bind(community, listener);
    }

    @Override
    public int getItemCount() {
        return communityList.size();
    }

    public void setList(List<Community> list) {
        this.communityList = list;
        notifyDataSetChanged();
    }

    static class CommunityViewHolder extends RecyclerView.ViewHolder {
        private TextView titleView;
        private TextView descriptionView;
        private TextView authorView;
        private TextView categoryView;
        private TextView likesView;
        private TextView commentsView;
        private ImageButton likeBtn;
        private ImageButton commentBtn;

        public CommunityViewHolder(View itemView) {
            super(itemView);
            titleView = itemView.findViewById(R.id.communityTitle);
            descriptionView = itemView.findViewById(R.id.communityDescription);
            authorView = itemView.findViewById(R.id.communityAuthor);
            categoryView = itemView.findViewById(R.id.communityCategory);
            likesView = itemView.findViewById(R.id.communityLikes);
            commentsView = itemView.findViewById(R.id.communityComments);
            likeBtn = itemView.findViewById(R.id.likeBtnCommunity);
            commentBtn = itemView.findViewById(R.id.commentBtnCommunity);
        }

        public void bind(Community community, OnCommunityClickListener listener) {
            titleView.setText(community.getTitle());
            descriptionView.setText(community.getDescription());
            authorView.setText("By: " + community.getAuthorName());
            categoryView.setText(community.getCategory());
            likesView.setText(String.valueOf(community.getLikes()));
            commentsView.setText(String.valueOf(community.getComments()));

            likeBtn.setOnClickListener(v -> listener.onLikeClick(community));
            commentBtn.setOnClickListener(v -> listener.onCommentClick(community));
        }
    }
}
