/* eslint-disable camelcase */

exports.up = (pgm) => {
    // memberikan constraint foreign key pada kolom owner dan comment_id
    // terhadap users.id dan comments.id
    pgm.addConstraint(
        'replies',
        'fk_replies.owner',
        'FOREIGN KEY(owner) REFERENCES users(id) ON DELETE CASCADE',
    );
    pgm.addConstraint(
        'replies',
        'fk_replies.commentId',
        'FOREIGN KEY(comment_id) REFERENCES comments(id) ON DELETE CASCADE',
    );
};

exports.down = (pgm) => {
    // menghapus constraint foreign keys
    pgm.dropConstraint('replies', 'fk_replies.owner');
    pgm.dropConstraint('replies', 'fk_replies.commentId');
};
