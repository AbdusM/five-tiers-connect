export interface Review {
  author: string;
  rating: number;
  text: string;
  date: string;
  platform: "google" | "yelp" | "facebook" | "instagram";
}

export interface Business {
  name: string;
  tagline: string;
  emoji: string;
  accentColor: string;
  rating: number;
  reviewCount: number;
  links: {
    google?: string;
    yelp?: string;
    instagram?: string;
    facebook?: string;
  };
  featuredReviews: Review[];
}

export const businesses: Record<string, Business> = {
  "fresh-cuts": {
    name: "Fresh Cuts Barbershop",
    tagline: "Best fades in Brooklyn since 2018",
    emoji: "✂️",
    accentColor: "amber",
    rating: 4.9,
    reviewCount: 127,
    links: {
      google: "https://g.page/r/example/review",
      yelp: "https://yelp.com/biz/example",
      instagram: "https://instagram.com/freshcuts",
    },
    featuredReviews: [
      {
        author: "Marcus T.",
        rating: 5,
        text: "Best fade I've ever had. Jay is a wizard with the clippers. Been coming here for 2 years and never disappointed.",
        date: "2 weeks ago",
        platform: "google",
      },
      {
        author: "Dre Williams",
        rating: 5,
        text: "Clean shop, skilled barbers, great vibes. What more could you ask for?",
        date: "1 month ago",
        platform: "yelp",
      },
      {
        author: "Mike R.",
        rating: 5,
        text: "Finally found my spot. The attention to detail here is unmatched.",
        date: "3 weeks ago",
        platform: "google",
      },
    ],
  },

  "elite-auto": {
    name: "Elite Auto Detailing",
    tagline: "Your car deserves the best",
    emoji: "🚗",
    accentColor: "blue",
    rating: 4.8,
    reviewCount: 89,
    links: {
      google: "https://g.page/r/example/review",
      yelp: "https://yelp.com/biz/example",
      facebook: "https://facebook.com/eliteauto/reviews",
    },
    featuredReviews: [
      {
        author: "Sarah K.",
        rating: 5,
        text: "They made my 10 year old car look brand new. Incredible work!",
        date: "1 week ago",
        platform: "google",
      },
      {
        author: "James P.",
        rating: 5,
        text: "Best detail I've ever gotten. Interior looks showroom fresh.",
        date: "2 weeks ago",
        platform: "yelp",
      },
      {
        author: "Linda M.",
        rating: 5,
        text: "Professional, thorough, and reasonably priced. My go-to from now on.",
        date: "3 weeks ago",
        platform: "google",
      },
    ],
  },

  "polished-nails": {
    name: "Polished Nail Studio",
    tagline: "Where self-care meets artistry",
    emoji: "💅",
    accentColor: "pink",
    rating: 4.9,
    reviewCount: 203,
    links: {
      google: "https://g.page/r/example/review",
      yelp: "https://yelp.com/biz/example",
      instagram: "https://instagram.com/polishednails",
    },
    featuredReviews: [
      {
        author: "Jessica L.",
        rating: 5,
        text: "The nail art here is insane! Got so many compliments on my set. Already booked my next appointment.",
        date: "1 week ago",
        platform: "instagram",
      },
      {
        author: "Aisha M.",
        rating: 5,
        text: "Finally found a salon that actually listens. Clean, friendly, and talented techs.",
        date: "2 weeks ago",
        platform: "google",
      },
      {
        author: "Rachel T.",
        rating: 5,
        text: "Best gel manicure I've ever had. Lasted 3 weeks with zero chips!",
        date: "1 month ago",
        platform: "yelp",
      },
    ],
  },

  "iron-temple": {
    name: "Iron Temple Gym",
    tagline: "Forge your best self",
    emoji: "🏋️",
    accentColor: "red",
    rating: 4.7,
    reviewCount: 156,
    links: {
      google: "https://g.page/r/example/review",
      yelp: "https://yelp.com/biz/example",
      instagram: "https://instagram.com/irontemple",
    },
    featuredReviews: [
      {
        author: "Chris B.",
        rating: 5,
        text: "No ego lifters, great equipment, 24/7 access. This is the gym I've been looking for.",
        date: "1 week ago",
        platform: "google",
      },
      {
        author: "Amanda S.",
        rating: 5,
        text: "The trainers here actually care about your progress. Down 30 lbs in 4 months!",
        date: "2 weeks ago",
        platform: "google",
      },
      {
        author: "Derek W.",
        rating: 4,
        text: "Solid gym with a great community. Gets busy at peak hours but worth it.",
        date: "3 weeks ago",
        platform: "yelp",
      },
    ],
  },

  "sacred-ink": {
    name: "Sacred Ink Tattoo",
    tagline: "Your story, our canvas",
    emoji: "🎨",
    accentColor: "purple",
    rating: 4.9,
    reviewCount: 312,
    links: {
      google: "https://g.page/r/example/review",
      instagram: "https://instagram.com/sacredink",
    },
    featuredReviews: [
      {
        author: "Tyler R.",
        rating: 5,
        text: "Got my sleeve finished here. The attention to detail is incredible. Worth every penny.",
        date: "1 week ago",
        platform: "google",
      },
      {
        author: "Megan K.",
        rating: 5,
        text: "First tattoo ever and they made me feel so comfortable. It's perfect!",
        date: "2 weeks ago",
        platform: "instagram",
      },
      {
        author: "Jake D.",
        rating: 5,
        text: "Clean shop, talented artists, and they really take time to get the design right.",
        date: "1 month ago",
        platform: "google",
      },
    ],
  },

  "mamas-kitchen": {
    name: "Mama's Kitchen",
    tagline: "Soul food made with love",
    emoji: "🍽️",
    accentColor: "orange",
    rating: 4.8,
    reviewCount: 478,
    links: {
      google: "https://g.page/r/example/review",
      yelp: "https://yelp.com/biz/example",
      facebook: "https://facebook.com/mamaskitchen/reviews",
    },
    featuredReviews: [
      {
        author: "David H.",
        rating: 5,
        text: "The mac and cheese alone is worth the trip. Tastes like my grandma's cooking.",
        date: "3 days ago",
        platform: "google",
      },
      {
        author: "Keisha W.",
        rating: 5,
        text: "Best fried chicken in the city. Period. Don't argue with me.",
        date: "1 week ago",
        platform: "yelp",
      },
      {
        author: "Robert J.",
        rating: 5,
        text: "Generous portions, amazing flavor, and the staff treats you like family.",
        date: "2 weeks ago",
        platform: "google",
      },
    ],
  },

  "zen-spa": {
    name: "Zen Day Spa",
    tagline: "Escape. Relax. Renew.",
    emoji: "🧘",
    accentColor: "teal",
    rating: 4.9,
    reviewCount: 189,
    links: {
      google: "https://g.page/r/example/review",
      yelp: "https://yelp.com/biz/example",
      instagram: "https://instagram.com/zenspa",
    },
    featuredReviews: [
      {
        author: "Nicole P.",
        rating: 5,
        text: "The hot stone massage was pure heaven. I floated out of there.",
        date: "1 week ago",
        platform: "google",
      },
      {
        author: "Maria G.",
        rating: 5,
        text: "Peaceful atmosphere, skilled therapists, and they remember your preferences.",
        date: "2 weeks ago",
        platform: "yelp",
      },
      {
        author: "Stephanie L.",
        rating: 5,
        text: "My monthly self-care ritual. The facials here are transformative.",
        date: "3 weeks ago",
        platform: "instagram",
      },
    ],
  },
};

export function getBusiness(slug: string): Business | undefined {
  return businesses[slug];
}

export function getAllBusinessSlugs(): string[] {
  return Object.keys(businesses);
}
