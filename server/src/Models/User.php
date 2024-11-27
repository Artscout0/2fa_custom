<?php

namespace Tomasst\TotpServer\Models;
use Tomasst\TotpServer\Utils\Utils;
use \PDO;


class User {
    public ?PDO $pdo = null;

    function __construct()
    {
        $this->pdo = Utils::connectDatabase();
    }

    /**
     * Selects User by their ID.
     * 
     * @param int $id The ID of the User to select
     * @return array An array that represents the User selected. 
     * @return false false if the query fails
     */
    public function SelectUserById($id): array|false
    {
        $stmt = $this->pdo->prepare("SELECT * FROM twofa_user WHERE id = :id");
        $stmt->execute([':id' => $id]);
        return $stmt->fetch();
    }

    /**
     * Selects User by their username.
     * 
     * @param int $id The ID of the User to select
     * @return array An array that represents the User selected. 
     * @return false false if the query fails
     */
    public function SelectUserByEmail($email): array|false
    {
        $stmt = $this->pdo->prepare("SELECT * FROM twofa_user WHERE email = :email");
        $stmt->execute([':email' => $email]);
        return $stmt->fetch();
    }

    /**
     * Selects all the User
     * 
     * @return array an array containing the User
     * @return false false if the query fails
     */
    public function SelectAllUsers(): array|false
    {
        $stmt = $this->pdo->prepare("SELECT * FROM twofa_user");
        $stmt->execute();
        return $stmt->fetchAll();
    }

    /**
     * Deletes the User with the given id
     * 
     * @param int $id the id of the User to delete
     * @return bool weather successful
     */
    public function DeleteUserById($id): bool
    {
        $stmt = $this->pdo->prepare("DELETE FROM twofa_user WHERE id = :id");
        return $stmt->execute([':id' => $id]);
    }

    /**
     * Adds a new User with the given data to the database
     * 
     * @param array $data the data to be inserted
     * @param PDO $pdo the connection to the database
     * @return bool weather successful
     */
    public function InsertNewUser(array $data): bool
    {
        $stmt = $this->pdo->prepare("INSERT INTO twofa_user (email, password_hash, user_secret) VALUES (:email, :password_hash, :user_secret)");
        return $stmt->execute($data);
    }
}