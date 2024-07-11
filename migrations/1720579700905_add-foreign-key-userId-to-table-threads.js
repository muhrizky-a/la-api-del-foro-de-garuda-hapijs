/* eslint-disable camelcase */

exports.up = (pgm) => {
    // memberikan constraint foreign key pada owner terhadap kolom id dari tabel users
    pgm.addConstraint(
        'threads',
        'fk_threads.owner',
        'FOREIGN KEY(owner) REFERENCES users(id) ON DELETE CASCADE',
    );
};

exports.down = (pgm) => {
    // menghapus constraint fk_threads.owner pada tabel threads
    pgm.dropConstraint('threads', 'fk_threads.owner');
};