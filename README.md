# hr-find-strings

This script was completed for the Hacker Rank challenge Find Strings.  The goal was to use a suffix tree algorithm that
was sufficiently optimized.  After trying more naive methods, I decided to use the Ukkonen algorithm with some
modifications for indexing and sorting, as well as a custom string comparator that quickly returns the first index that
two strings are different.