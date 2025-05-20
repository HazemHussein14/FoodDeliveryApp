
CREATE TABLE menu_item (
    menu_item_id SERIAL PRIMARY KEY,
    menu_id INT NOT NULL REFERENCES menu(menu_id),
    item_id INT NOT NULL REFERENCES item(item_id),
);
