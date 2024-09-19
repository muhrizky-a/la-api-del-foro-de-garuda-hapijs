exports.up = (pgm) => {
  // memberikan constraint foreign key pada kolom user_id dan comment_id
  // terhadap users.id dan comments.id
  pgm.addConstraint(
    'comment_likes',
    'fk_comment_likes.userId',
    'FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE',
  );
  pgm.addConstraint(
    'comment_likes',
    'fk_comment_likes.commentId',
    'FOREIGN KEY(comment_id) REFERENCES comments(id) ON DELETE CASCADE',
  );
};

exports.down = (pgm) => {
  // menghapus constraint foreign keys
  pgm.dropConstraint('comment_likes', 'fk_comment_likes.userId');
  pgm.dropConstraint('comment_likes', 'fk_comment_likes.commentId');
};
