function init_navbar()
{
	let burger_selector = "header.navbar .navbar-burger";
	let menu_selector   = "header.navbar .navbar-menu";

	let burger = document.querySelector(burger_selector);
	let menu   = document.querySelector(menu_selector);

	if (burger === undefined || menu === undefined)
	{
		console.warn("Undefined burger or menu element!");

		return;
	}

	burger.addEventListener(
		"click",
		function()
		{
			burger.classList.toggle("is-active");
			menu.classList.toggle("is-active");
		}
	);

	return;
}


async function main()
{
	init_navbar();

	return;
}


document.onload = main();
