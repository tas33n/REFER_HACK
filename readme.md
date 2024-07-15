# Reffer_HAck

This project is a Node.js script designed to create mass accounts on a target site to gain referral bonuses. The script automates the registration process using a list of names and user agents, and logs the results into `accounts.txt`.

## Features

- **Mass Account Creation**: Automates the registration of multiple accounts.
- **Random User Agents**: Uses a list of user agents to avoid detection.
- **Logging**: Logs the registered accounts into `accounts.txt`.

## Installation

1. **Clone the repository**:
    ```sh
    git clone https://github.com/yourusername/Reffer_HAck.git
    cd Reffer_HAck
    ```

2. **Install dependencies**:
    ```sh
    npm install
    ```

## Usage

1. **Prepare your name list**:
    - Create a file named `names.txt` in the root directory.
    - Add names in the format `FirstName LastName` (one per line).

2. **Prepare your user agents list**:
    - Create a file named `user-agents.txt` in the root directory.
    - Add user agents (one per line).

3. **Run the script**:
    ```sh
    node index.js
    ```

## Output

- **accounts.txt**: Contains the registered accounts in the format `email:password`.

## Example Output
Total successful registrations: 10
Total failed registrations: 2


## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Contributing

1. Fork the repository.
2. Create your feature branch (`git checkout -b feature/fooBar`).
3. Commit your changes (`git commit -am 'Add some fooBar'`).
4. Push to the branch (`git push origin feature/fooBar`).
5. Create a new Pull Request.

## Contact

For any inquiries, please contact [Telegram](https://t.me/lamb3rt).

---

*Happy Coding!* 🚀