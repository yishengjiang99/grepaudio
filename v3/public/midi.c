#include <stdlib.h>
#include <stdio.h>
int main(int argc, char **argv)
{
	printf("hello");
	FILE *f = fopen("./song.mid", "r");
	if (!f)
		perror("404");
	char c, array[222];
	char *types;
	int length;
	fscanf(f, "%4s%d", array, &length);
	printf("type: %s length %d", array, length);
}