$( "#username_form" ).submit(function( event ) {
    // Prevent redirect
    event.preventDefault();
   
    // Empty gallery
    $('#gallery').html("");
    
    // Extract username
    let username = $("#username_value").val().trim();

    // If any username, fetch the posts
    if(username){
        fetch_posts(username);
    }
    // Otherwise display an error
    else {
        alert("Please enter a username");
    }
    
});

function fetch_posts(username) {
    $.getJSON(`https://www.instagram.com/${username}/?__a=1`, (data) => {
        
        // Get the template
        var template = $('#post_template').html();
        var caption = $('#caption_template').html();
        
        // Get the media files
        let media = data.graphql.user.edge_owner_to_timeline_media.edges;
        
        // Link to the gallery
        let gallery = $('#gallery');
        let captions = $('#captions');
        // If there is no media, display an error and leave
        if(media.length == 0){
            alert("No posts by this user");
            return;
        }

        // Loop through every post and create appropriate gallery for them
        media.forEach((post) => {
            post = post.node;
            console.log(post);
            
            // Clone the template
            var item = $(template).clone();

            // Create image tag with the images
            var img = $('<img />', { 
                class: "materialboxed",
                src: post.display_url,
                alt: post.accessibility_caption
              });

            // Set the image
            $(item).find('.card-image').prepend(img);
    
            // Create a caption model only if it exists
            if(post.edge_media_to_caption.edges.length > 0){
                let caption_content = "<p>" + post.edge_media_to_caption.edges[0].node.text + "</p>";
                
                $(item).find('.card-content').html(caption_content);
                
                var model = $(caption).clone();
                
                // Create a div with appropriate link
                $(item).find('.card-action').append(
                    `<div class="col s6">
                    <a class="read-more modal-trigger waves-effect waves-light btn" href='#caption_${post.id}'> Open Caption </a>
                    </div>`
                );
                
                // Update the caption details
                $(model).prop('id', `caption_${post.id}`);
                $(model).find(".modal-content").html(caption_content);
                captions.append(model);
            }

            // Add a direct link to instagram post
            $(item).find('.open-instagram').attr("href", `https://www.instagram.com/p/${post.shortcode}/`);
            
            // Append the post to gallery
            gallery.append(item);
        });

        $('.materialboxed').materialbox();
        $('.modal').modal();

    }).fail(function() {
        alert("Either an invalid username or a private account");
    });
}