all:
	npm install
	npm start

clean:
	rm -r node_modules
	rm package-lock.json

fclean: clean

