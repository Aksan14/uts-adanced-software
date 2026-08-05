Feature: KosHub Room Boarding Reservation System
  As a customer
  I want to login, manage my cart, and reserve rooms online
  So that I can secure a room easily

  Scenario: Success login with correct credentials
    Given a user with email "user1@koshub.com" and password "user123" exists
    When I send a POST request to "/api/login" with email "user1@koshub.com" and password "user123"
    Then the response status code should be 200
    And the response message should be "login berhasil"
    And the response should contain a JWT token

  Scenario: Fail login with incorrect password
    Given a user with email "user1@koshub.com" and password "user123" exists
    When I send a POST request to "/api/login" with email "user1@koshub.com" and password "wrongpass"
    Then the response status code should be 401
    And the response message should be "email atau password salah"

  Scenario: Add room to cart within limits
    Given a room "Kamar Cozy A" with price 1000000 and stock 5 exists
    And I am logged in as "user1@koshub.com"
    When I add room "Kamar Cozy A" with quantity 2 to my cart
    Then the response status code should be 201
    And the cart should contain "Kamar Cozy A" with quantity 2

  Scenario: Fail adding room to cart exceeding stock
    Given a room "Kamar Cozy A" with price 1000000 and stock 5 exists
    And I am logged in as "user1@koshub.com"
    When I add room "Kamar Cozy A" with quantity 6 to my cart
    Then the response status code should be 400
    And the response error message should be "kuantitas melebihi stok kamar yang tersedia"

  Scenario: Success checkout with complete details
    Given I have a room "Kamar Cozy A" with quantity 2 in my cart
    And I am logged in as "user1@koshub.com"
    When I checkout with name "Asep", phone "081234567890", and address "Bandung"
    Then the response status code should be 201
    And a reservation number should be generated
    And the reservation status should be "DRAFT"
    And my cart should be empty
