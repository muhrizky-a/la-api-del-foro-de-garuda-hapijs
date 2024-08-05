/* eslint-disable camelcase */

exports.up = (pgm) => {
  // memberikan constraint foreign key pada kolom owner dan thread_id
  // terhadap users.id dan threads.id
  pgm.addConstraint(
    'comments',
    'fk_comments.owner',
    'FOREIGN KEY(owner) REFERENCES users(id) ON DELETE CASCADE',
  );
  pgm.addConstraint(
    'comments',
    'fk_comments.threadId',
    'FOREIGN KEY(thread_id) REFERENCES threads(id) ON DELETE CASCADE',
  );
};

exports.down = (pgm) => {
  // menghapus constraint foreign keys
  pgm.dropConstraint('comments', 'fk_comments.owner');
  pgm.dropConstraint('comments', 'fk_comments.threadId');
};
