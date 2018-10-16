/**
 * This is the function that takes the input in and satisfies the output requirements using the functions below
 * @param w
 * @param queries
 * @returns {Array}
 */
function findStrings(w, queries) {

    for (var i = 0; i < w.length; i++) {
        injestString(w[i]);
    }
    var out = [];

    for (var q = 0; q < queries.length; q++) {
        var result = locateIndex(node, queries[q]);
        out.push(result ? result : 'INVALID');
    }
    return out;
}


// this is the root/parent node
var node = {label: '', num: 0, data: [], parent: null};

/**
 * This indexes the string and all it's substrings using the Ukkonen suffix tree algorithm.  It also alphabetically
 * sorts and numerically indexes all additions.
 * @param node
 * @param str
 */
function indexString(node, str) {
    var pos = -1;
    var target = null;
    var targetMatches;
    var newNode = {};

    for (var i = 0; i < node.data.length; i++) {
        var leaf = node.data[i].label;
        var matches = indexOfFirstDiff(str, leaf);
        if (matches > 0) {
            target = node.data[i];
            targetMatches = matches;
        }
        if (str < leaf && pos < 0)
            pos = i;
    }
    if (target !== null) {
        if (targetMatches < target.label.length) {
            // target must be split
            var suffix = target.label.substr(targetMatches); // this is the ending that was split
            target.label = target.label.substr(0,targetMatches); // this is the prefix we like
            // the suffix needs to be added to the target
            // if there are any children, they are assumed to belong to the suffix too
            newNode = {label: suffix, num: suffix.replace('$','').length, data: [], parent: target};
            var abandonedNodes = target.data;
            target.data = [newNode];
            abandonedNodes.forEach(function (aNode) {
                aNode.parent = newNode;
                newNode.num += aNode.num;
                console.log('anode num '+aNode.label+' '+aNode.num);
            });
            newNode.data = abandonedNodes;
            // at this point the children have been moved
            // the target should be able to receive str now
        }
        indexString(target, str.substr(targetMatches));
    } else {
        if (pos === -1)
            pos = node.data.length;

        newNode = {label: str, num: 0, data: [], parent: node};
        node.data.splice(pos,0, newNode);
        incrementParent(newNode, str.replace('$','').length);
    }
}

/**
 * A helper function that allows the indexer to track the number of child substrings
 * @param node
 * @param count
 */
function incrementParent(node, count) {
    // We need to count the additions to make searching by index faster
    var parent = node;

    while (parent !== null) {
        parent.num += count;
        parent = parent.parent;
    }
}

/**
 * Takes a string and adds it to the parent node.  Uses $ as the string end symbol (but could be something else)
 * @param str
 */
function injestString(str) {
    for (var i = str.length-1; i >= 0; i--)
        indexString(node,str.substr(i)+'$');
}


/**
 * Returns the string at given index, or null
 * @param node
 * @param index
 * @param str
 * @returns {*}
 */
function locateIndex(node, index, str = '') {
    if (index > node.num) return null;
    var len = node.label.replace('$','').length;
    var llen = 0;
    if (index <= len) {
        //console.log('hm');
        return str + node.label.substr(0,index);
    }
    if (index > len) {
        index -= len;
        for (var i = 0; i < node.data.length; i++) {
            if (node.data[i].num >= index) {
                return locateIndex(node.data[i], index, str + node.label);
            }
            llen  -= node.data[i].num;
            index -= node.data[i].num;
        }
    }
    return null;
}


/**
 * Determine if the strings are equal or find the first instance they are different.  Designed to tackle really
 * expensive problems more efficiently.  This was a separate project that found use in the find string algorithm.
 * It works by dividing the strings down until the difference is identified (strings over 32 chars) or doing a naive
 * comparison otherwise.
 * @param s1 String
 * @param s2 String of same length as s1
 * @returns Number (-1 if equal, otherwise the offset)
 */
function indexOfFirstDiff(s1, s2) {
    return s2.length > 32 ? stringFirstDiffPositionLarge(s1, s2) : stringFirstDiffPositionSmall(s1, s2);
}

// this function requires that s2 be longer or equal length to s1
function stringFirstDiffPositionLarge(s1, s2, score = 0) {
    if (s1 !== s2) {
        if (s1.length > 1) {
            var len2 = Math.ceil(s1.length / 2);
            var newscore = stringFirstDiffPositionLarge(s1.substr(0, len2), s2.substr(0, len2), score);

            // strings from the first half are equal but we know there is a difference
            // the difference must be in the second part of the string
            // this changes the offset to + half the length of the string
            if (newscore === -1)
                newscore = stringFirstDiffPositionLarge(s1.substr(len2), s2.substr(len2), score + len2);

            return newscore;
        } else {
            return score;
        }
    }
    // strings are equal
    return -1;
}

function stringFirstDiffPositionSmall(s1, s2) {
    if (s1 === s2) {
        return -1;
    }
    for (var b = 0; b < s2.length; b++) {
        if (s1.substr(b, 1) !== s2.substr(b, 1)) {
            break;
        }
    }
    return b;
}